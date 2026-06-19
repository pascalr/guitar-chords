#!/usr/bin/env python3

import os
from pathlib import Path

# Configuration
CHORDS_DIR = "./data/chords"
OUTPUT_PATH = "./docs/index.html"

def generate_index():
    # Target directory for the index file
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    
    # Collect and sort filenames without their extensions
    songs = []
    if os.path.exists(CHORDS_DIR):
        for filename in os.listdir(CHORDS_DIR):
            file_path = os.path.join(CHORDS_DIR, filename)
            if os.path.isfile(file_path):
                # Path().stem extracts just the filename without the extension
                song_name = Path(filename).stem
                songs.append(song_name)
    
    songs.sort()  # Sort alphabetically

    # Generate the HTML list items
    list_items = ""
    for song in songs:
        list_items += f'            <li><a href="./c/{song}.html">{song}</a></li>\n'

    # Core HTML structure
    html_content = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site de Pascal - Accords</title>
    <link rel="stylesheet" href="./assets/style.css">
</head>
<body>

    <nav class="navbar">
        <div>Site de Pascal - Accords</div>
    </nav>

    <main class="content">
        <ul class="song-list">
            {list_items}
        </ul>
    </main>

    <script src="/assets/script.js"></script>
</body>
</html>
"""

    # Write or overwrite the index.html file
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(html_content)
        
    print(f"Successfully updated {OUTPUT_PATH} with {len(songs)} song links.")

if __name__ == "__main__":
    generate_index()