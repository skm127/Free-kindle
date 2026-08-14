import gdown
import json
import re
import time

url = "https://drive.google.com/drive/u/0/folders/15EwYfbQSy8lfjqvP4q5YnUPaECFTnVhv"

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

print(f"Retrying extraction for {url}...", flush=True)

max_retries = 5
for attempt in range(max_retries):
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
                print(f"Added {added} new books. Total: {len(all_books)}", flush=True)
            print("Extraction successful!", flush=True)
            break
        else:
            print("No files found or empty folder.", flush=True)
            break
    except Exception as e:
        print(f"Attempt {attempt + 1} failed: {e}", flush=True)
        time.sleep(5)
