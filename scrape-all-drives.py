import gdown
import json
import re
import os

urls = [
    "https://drive.google.com/drive/u/0/folders/15EwYfbQSy8lfjqvP4q5YnUPaECFTnVhv",
    "https://drive.google.com/drive/folders/0B2iEK7PB5AR-b01obXBHWHVHQzg",
    "https://drive.google.com/drive/folders/0BzQUrkcZOjAiYmQ0NTBjZmMtMDJjMS00OWViLTk0NWEtYTFhYzE2ZTZmYzdk",
    "https://drive.google.com/drive/folders/0B1k2RCDnejGvNFZWTWhJeDctWDQ",
    "https://drive.google.com/drive/folders/0B6hG9OOiP0g2Zkh4M2x3WnVJNWs",
    "https://drive.google.com/drive/folders/0B5xOSW6DBC5LfkVZWTJqYUZOb1gyQnlhSlc2U1RJWUFyWjBnUXc0dHlrTHR5dEUySXNYc0E",
    "https://drive.google.com/drive/folders/0B1_NUA4_UggJYUIwc09LX1dfcDA",
    "https://drive.google.com/drive/folders/0B2jZERjUXCHhZnB5T0tpY2ZyRmc",
    "https://drive.google.com/drive/folders/0B-JzQsKoJaANbTFGN0RWLWhONms",
    "https://drive.google.com/drive/folders/0B1dv5sqSPsPbfk1ZSXNud1pvWl9BV2Franh2ZFl0S0hweTBhT3QyNFUxWGgzQkFpOGUtd0k",
    "https://drive.google.com/drive/folders/0B0hgUX3me1_RNi1KTXBzXzdXSzA",
    "https://drive.google.com/drive/folders/0B09qtt10aqV1SGxRVXBWYmNIS2M",
    "https://drive.google.com/drive/folders/0B1v9Iy1jH3FXdlNDeUNHNEVsZlE",
    "https://drive.google.com/drive/folders/0B1Ef5shqGHDNRGEwd3BYb0N3Um8",
    "https://drive.google.com/drive/folders/0B_qpgvDTe8kraTQ2QkM2S19tQWs",
    "https://drive.google.com/drive/folders/0B4PtWlBoZ1rVSncxbi1JVFY4anM"
]

def load_existing():
    try:
        with open("src/data/drive_books.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return []

def save_books(books):
    with open("src/data/drive_books.json", "w", encoding="utf-8") as f:
        json.dump(books, f, indent=2, ensure_ascii=False)

def parse_filename(filename):
    filename = re.sub(r'\.(pdf|epub|azw3|mobi)$', '', filename, flags=re.IGNORECASE)
    parts = filename.split(' - ')
    if len(parts) >= 2:
        author = parts[-1].strip()
        title = ' - '.join(parts[:-1]).strip()
        return title, author
    return filename.strip(), "Unknown Author"

all_books = load_existing()
id_set = set([b['id'] for b in all_books])

for url in urls:
    print(f"Scraping {url}...", flush=True)
    try:
        files = gdown.download_folder(url, quiet=True, skip_download=True)
        if files:
            added = 0
            for f in files:
                fid = getattr(f, 'id', None)
                fname = getattr(f, 'name', None)
                
                if fid and fname:
                    if fname.lower().endswith(('.pdf', '.epub', '.azw3', '.mobi')):
                        if fid not in id_set:
                            id_set.add(fid)
                            title, author = parse_filename(fname)
                            all_books.append({
                                "id": fid,
                                "title": title,
                                "author": author,
                                "cover_url": "https://via.placeholder.com/300x450?text=Catsby+Library",
                                "download_url": f"https://drive.google.com/uc?export=download&id={fid}"
                            })
                            added += 1
            if added > 0:
                save_books(all_books)
                print(f"Added {added} new books from {url}. Total: {len(all_books)}", flush=True)
    except Exception as e:
        print(f"Failed {url}: {e}", flush=True)

print("Scraping completed!", flush=True)
