import json
d = json.load(open('src/data/drive_books.json'))
placeholders = [b for b in d if 'placeholder' in b.get('cover_url','')]
print(f'Total books: {len(d)}')
print(f'With placeholder covers: {len(placeholders)}')
print(f'Sample titles: {[b["title"][:50] for b in d[:5]]}')
print(f'Sample download_urls: {[b["download_url"][:60] for b in d[:3]]}')
# Check file size
import os
size_mb = os.path.getsize('src/data/drive_books.json') / (1024*1024)
print(f'drive_books.json size: {size_mb:.1f} MB')
