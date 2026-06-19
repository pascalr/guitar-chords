#!/usr/bin/env python3

import json
import html
import os
from pathlib import Path

# Configuration
CHORDS_DIR = "./data/chords"
INDEX_PATH = "docs/index.html"
SONGS_DIR = "docs/c"
SONGS_DATA_PATH = "./data/index.json"


def generate_site():
    # Ensure target directories exist
    os.makedirs(SONGS_DIR, exist_ok=True)

    songs = []

    # 1. Load existing index or initialize an empty dictionary
    if os.path.exists(SONGS_DATA_PATH):
        try:
            with open(SONGS_DATA_PATH, "r", encoding="utf-8") as f:
                index_data = json.load(f)
        except json.JSONDecodeError:
            print(f"Warning: {SONGS_DATA_PATH} was corrupted or empty. Initializing new index.")
            index_data = {}
    else:
        index_data = {}

    if not os.path.exists(CHORDS_DIR):
        print(f"Error: Source directory '{CHORDS_DIR}' does not exist.")
        return

    # Process each file in the chords directory
    for filename in os.listdir(CHORDS_DIR):
        file_path = os.path.join(CHORDS_DIR, filename)

        if os.path.isfile(file_path):
            song_name = Path(filename).stem
            songs.append(song_name)

            # 1. Read the raw chord/lyric file content
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    song_content = f.read()
            except Exception as e:
                print(f"Could not read {filename}: {e}")
                continue

            # Filter out lines starting with "Capo:" or "Key:"
            cleaned_lines = []
            for line in song_content.splitlines():
                # .lstrip() ensures it catches them even if there are accidental spaces before "Capo:"
                if line.lstrip().startswith("Capo:") or line.lstrip().startswith(
                    "Key:"
                ):
                    continue
                cleaned_lines.append(line)

            # Rejoin the lines and strip all whitespaces/newlines from the very beginning
            cleaned_text = "\n".join(cleaned_lines).lstrip()

            # Escape HTML characters so they don't break the rendering
            safe_content = html.escape(cleaned_text)

            column_count = index_data.get(filename, {}).get("column_count", 1)

            # 2. Build the individual song HTML template
            song_html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{song_name} - Site de Pascal</title>
    <link rel="stylesheet" href="../assets/style.css">
</head>
<body>

    <nav class="song-navbar">
        <div><a href=".." style="color: inherit; text-decoration: none;">← Retour</a></div>
        <div>{song_name}</div>
        <div></div>
    </nav>

    <pre style="--columns: {column_count};">{safe_content}</pre>

    <script src="/assets/script.js"></script>
</body>
</html>
"""

            # 3. Write the individual song file to docs/c/
            song_output_path = os.path.join(SONGS_DIR, f"{song_name}.html")
            with open(song_output_path, "w", encoding="utf-8") as f:
                f.write(song_html)

    # Sort the index list alphabetically
    songs.sort()

    # 4. Generate the index.html list items
    list_items = ""
    for song in songs:
        list_items += f'            <li><a href="./c/{song}.html">{song}</a></li>\n'

    # 5. Build and write the main index.html page
    index_html = f"""<!DOCTYPE html>
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

    <main class="index-content">
        <ul class="song-list">
            {list_items}
        </ul>
    </main>

    <script src="/assets/script.js"></script>
</body>
</html>
"""

    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        f.write(index_html)

    print(f"Generated {len(songs)} song pages in '{SONGS_DIR}/'")
    print(f"Updated index page at '{INDEX_PATH}'")


if __name__ == "__main__":
    generate_site()