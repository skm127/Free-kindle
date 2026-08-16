"""
Google Drive API Book Scraper — Robust version with:
- Rate limiting (0.3s between requests)
- Exponential backoff retries (up to 5 retries per request)
- Incremental saves (saves after each top-level folder)
- Resume capability (skips already-known file IDs)
- Progress reporting
"""

import requests
import json
import re
import sys
import time
import os
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

API_KEY = sys.argv[1] if len(sys.argv) > 1 else None
if not API_KEY:
    print("Usage: python scrape-drive-robust.py <GOOGLE_DRIVE_API_KEY>")
    sys.exit(1)

BOOK_EXTENSIONS = ('.pdf', '.epub', '.azw3', '.mobi')
OUTPUT_FILE = "src/data/drive_books.json"
REQUEST_DELAY = 0.35  # seconds between API calls
MAX_RETRIES = 5

# All 16 drive folder URLs
DRIVE_URLS = [
    ("Main Library", "15EwYfbQSy8lfjqvP4q5YnUPaECFTnVhv"),
    ("Programming Books", "0B2iEK7PB5AR-b01obXBHWHVHQzg"),
    ("300 Medical Books", "0BzQUrkcZOjAiYmQ0NTBjZmMtMDJjMS00OWViLTk0NWEtYTFhYzE2ZTZmYzdk"),
    ("Mechanical Engineering", "0B1k2RCDnejGvNFZWTWhJeDctWDQ"),
    ("Study Books", "0B6hG9OOiP0g2Zkh4M2x3WnVJNWs"),
    ("English", "0B5xOSW6DBC5LfkVZWTJqYUZOb1gyQnlhSlc2U1RJWUFyWjBnUXc0dHlrTHR5dEUySXNYc0E"),
    ("English Grammar", "0B1_NUA4_UggJYUIwc09LX1dfcDA"),
    ("GMAT/GRE/TOEFL/IELTS", "0B2jZERjUXCHhZnB5T0tpY2ZyRmc"),
    ("Hacking E-books", "0B-JzQsKoJaANbTFGN0RWLWhONms"),
    ("Books Collection 1", "0B1dv5sqSPsPbfk1ZSXNud1pvWl9BV2Franh2ZFl0S0hweTBhT3QyNFUxWGgzQkFpOGUtd0k"),
    ("Books Collection 2", "0B0hgUX3me1_RNi1KTXBzXzdXSzA"),
    ("Books Collection 3", "0B09qtt10aqV1SGxRVXBWYmNIS2M"),
    ("Novels 1", "0B1v9Iy1jH3FXdlNDeUNHNEVsZlE"),
    ("Novels 2", "0B1Ef5shqGHDNRGEwd3BYb0N3Um8"),
    ("Novels 3", "0B_qpgvDTe8kraTQ2QkM2S19tQWs"),
    ("Novels 4", "0B4PtWlBoZ1rVSncxbi1JVFY4anM"),
]

# Create a robust HTTP session with automatic retries
session = requests.Session()
retry_strategy = Retry(
    total=3,
    backoff_factor=1,
    status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=["GET"]
)
adapter = HTTPAdapter(max_retries=retry_strategy)
session.mount("https://", adapter)
session.mount("http://", adapter)


def load_existing():
    try:
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def save_books(books):
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(books, f, indent=2, ensure_ascii=False)


def parse_filename(filename):
    """Extract title and author from filename like 'Title - Author.epub'"""
    filename = re.sub(r'\.(pdf|epub|azw3|mobi)$', '', filename, flags=re.IGNORECASE)
    parts = filename.split(' - ')
    if len(parts) >= 2:
        author = parts[-1].strip()
        title = ' - '.join(parts[:-1]).strip()
        return title, author
    return filename.strip(), "Unknown Author"


def api_list_files(folder_id, retries=MAX_RETRIES):
    """List files in a Google Drive folder via API with retries."""
    url = "https://www.googleapis.com/drive/v3/files"
    all_items = []
    page_token = None
    
    while True:
        params = {
            'key': API_KEY,
            'q': f"'{folder_id}' in parents and trashed = false",
            'fields': "nextPageToken, files(id, name, mimeType)",
            'pageSize': 1000,
        }
        if page_token:
            params['pageToken'] = page_token
        
        for attempt in range(retries):
            try:
                time.sleep(REQUEST_DELAY)
                response = session.get(url, params=params, timeout=30)
                
                if response.status_code == 403:
                    error = response.json().get('error', {})
                    reason = error.get('errors', [{}])[0].get('reason', '')
                    if reason == 'rateLimitExceeded':
                        wait = (2 ** attempt) * 2
                        print(f"    Rate limited, waiting {wait}s...", flush=True)
                        time.sleep(wait)
                        continue
                    else:
                        # Folder not accessible
                        return all_items
                
                if response.status_code == 404:
                    return all_items
                    
                response.raise_for_status()
                data = response.json()
                all_items.extend(data.get('files', []))
                
                page_token = data.get('nextPageToken')
                break  # success
                
            except requests.exceptions.ConnectionError as e:
                wait = (2 ** attempt) * 2
                print(f"    Connection error (attempt {attempt+1}/{retries}), retrying in {wait}s...", flush=True)
                time.sleep(wait)
            except requests.exceptions.Timeout:
                wait = (2 ** attempt) * 2
                print(f"    Timeout (attempt {attempt+1}/{retries}), retrying in {wait}s...", flush=True)
                time.sleep(wait)
            except Exception as e:
                print(f"    Error: {e}", flush=True)
                if attempt == retries - 1:
                    return all_items
                wait = (2 ** attempt) * 2
                time.sleep(wait)
        else:
            # All retries exhausted for this page
            print(f"    All retries exhausted for folder {folder_id}", flush=True)
            break
        
        if not page_token:
            break
    
    return all_items


def crawl_folder(folder_id, depth=0, id_set=None):
    """Recursively crawl a folder and return all book files found."""
    if id_set is None:
        id_set = set()
    
    books = []
    indent = "  " * depth
    
    items = api_list_files(folder_id)
    
    folders = [i for i in items if i['mimeType'] == 'application/vnd.google-apps.folder']
    files = [i for i in items if i['mimeType'] != 'application/vnd.google-apps.folder']
    
    # Process book files at this level
    for f in files:
        if f['name'].lower().endswith(BOOK_EXTENSIONS) and f['id'] not in id_set:
            id_set.add(f['id'])
            title, author = parse_filename(f['name'])
            books.append({
                "id": f['id'],
                "title": title,
                "author": author,
                "cover_url": f"https://via.placeholder.com/300x450?text={title[:20].replace(' ', '+')}",
                "download_url": f"https://drive.google.com/uc?export=download&id={f['id']}"
            })
    
    # Recurse into subfolders
    for folder in folders:
        if depth < 5:  # safety limit
            print(f"{indent}  📁 {folder['name']}", flush=True)
            sub_books = crawl_folder(folder['id'], depth + 1, id_set)
            books.extend(sub_books)
    
    return books


def main():
    print("=" * 60, flush=True)
    print("  Google Drive Book Scraper (API v3 — Robust)", flush=True)
    print("=" * 60, flush=True)
    
    all_books = load_existing()
    id_set = set(b['id'] for b in all_books)
    total_added = 0
    
    print(f"\nExisting books in database: {len(all_books)}", flush=True)
    print(f"Folders to scrape: {len(DRIVE_URLS)}\n", flush=True)
    
    for i, (name, folder_id) in enumerate(DRIVE_URLS, 1):
        print(f"\n[{i}/{len(DRIVE_URLS)}] 📚 {name} ({folder_id[:12]}...)", flush=True)
        
        new_books = crawl_folder(folder_id, depth=0, id_set=id_set)
        
        if new_books:
            all_books.extend(new_books)
            save_books(all_books)  # incremental save after each folder
            total_added += len(new_books)
            print(f"  ✅ Added {len(new_books)} books (running total: {len(all_books)})", flush=True)
        else:
            print(f"  ⚠️  No new books found (may not be publicly shared via API)", flush=True)
    
    print(f"\n{'=' * 60}", flush=True)
    print(f"  DONE! Total books in database: {len(all_books)}", flush=True)
    print(f"  New books added this run: {total_added}", flush=True)
    print(f"{'=' * 60}", flush=True)


if __name__ == "__main__":
    main()
