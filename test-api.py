import requests
import sys

API_KEY = sys.argv[1]
folder_id = '15EwYfbQSy8lfjqvP4q5YnUPaECFTnVhv'
url = 'https://www.googleapis.com/drive/v3/files'
params = {
    'key': API_KEY,
    'q': f"'{folder_id}' in parents and trashed = false",
    'fields': 'files(id, name, mimeType)'
}
try:
    response = requests.get(url, params=params)
    print(response.status_code)
    if response.status_code != 200:
        print(response.text)
    else:
        files = response.json().get('files', [])
        print(f'Found {len(files)} files.')
        print(files[:3])
except Exception as e:
    print(e)
