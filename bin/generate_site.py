#!/usr/bin/env python3

import json
import html
import os
import re
import math
from pathlib import Path
from urllib.parse import quote_plus

# Configuration
CHORDS_DIR = "./data/chords"
INDEX_PATH = "docs/index.html"
SONGS_DIR = "docs/c"
SONGS_DATA_PATH = "./data/index.json"

NOTE = r"[A-G][b#♯♭]?" # matches A, Ab, A#
CHORD = (
    NOTE + r"(m|maj|min|dim|aug|sus|add|2|4|5|6|7|9|11|13|\+|\-)*" # matches Am, Abmin, E+, ...
)
CHORD_REGEX = re.compile(
    r"^("
        r"\|?" # matches |
        + CHORD +
        r"([\/\\]"+CHORD+")?" # matches A/F#, Am\G
        r",?" # matches ,
        r"\**" # matches * or **
        r"\|?" # matches |
        r"(\d+[xX]|[xX]\d+)?" # matches x2 or 2x
        r"|(\d+[xX]|[xX]\d+)" # matches x2 or 2x standalone, not directly after a chord
        r"|N\.?C\.?" # matches N.C. or NC or NC.
        r"|slide" # matches slide
        r"|RIFF( \d+)?" # matches RIFF
        r"|\d" # matches a number (was added for RIFF 1, RIFF 2...)
        r"|\*" # matches standalone asterisk
        r"|\|?" # matches |
        r"|\/?" # matches /
        r"|\\?" # matches \
        r"|\-?" # matches -
    r")$"
)

PARENTHESIS_CLEANER = re.compile(r"\([^)]*\)")

def is_chord_line(line_text):
    """Returns True if every word in the line matches a chord structure."""

    # Remove anything inside parentheses (including parentheses themselves)
    cleaned_line = PARENTHESIS_CLEANER.sub("", line_text)

    words = cleaned_line.split()
    if not words:
        return False  # Empty lines are not chord lines

    return all(CHORD_REGEX.fullmatch(w) for w in words)

def convert_chordpro_to_inline(chordpro_text: str) -> str:
    """
    Converts a ChordPro formatted string (with chords in square brackets)
    into a traditional chord-over-lyrics format with proper spacing.
    """
    output_lines = []
    
    # Split the input text into individual lines
    lines = chordpro_text.splitlines()
    
    for line in lines:
        # Check if the line contains any chords
        if '[' not in line:
            # If no chords, just keep the line as is (e.g., headers or blank lines)
            output_lines.append(line)
            continue
            
        chord_line = ""
        lyric_line = ""
        current_lyric_index = 0
        
        # Find all occurrences of chords wrapped in brackets
        # re.finditer gives us the match and its position in the original string
        matches = list(re.finditer(r'\[([^\]]+)\]', line))
        
        for i, match in enumerate(matches):
            chord = match.group(1)
            match_start = match.start()
            
            # 1. Append the lyrics that came BEFORE this chord
            # We must strip out previous chords to know the true lyric position
            previous_lyrics = line[current_lyric_index:match_start]
            lyric_line += previous_lyrics
            
            # 2. Calculate how many spaces we need on the chord line 
            # to line it up perfectly with the current length of the lyric line
            spaces_needed = len(lyric_line) - len(chord_line)
            
            if spaces_needed > 0:
                chord_line += " " * spaces_needed
            elif len(chord_line) > 0 and spaces_needed <= 0:
                # If chords are back-to-back, add a single space so they don't merge
                chord_line += " "
                # Pad the lyric line to keep up with the chord line spacing
                lyric_line += " " * (len(chord_line) - len(lyric_line))
            
            # 3. Add the chord to the chord line
            chord_line += chord
            
            # Update our index pointer past the current [Chord] tag
            current_lyric_index = match.end()
            
        # Append any remaining lyrics after the last chord
        lyric_line += line[current_lyric_index:]
        
        # Combine the chord line and lyric line, then add to output
        output_lines.append(chord_line.rstrip())
        output_lines.append(lyric_line.rstrip())
        
    return "\n".join(output_lines)

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
            song_filename = Path(filename).stem
            is_chordpro = index_data.get(filename, {}).get("chordpro", False)
            song_author = index_data.get(filename, {}).get("author", "")
            song_name = index_data.get(filename, {}).get("name", "")

            # Append as a dictionary
            songs.append({
                "url": song_filename,
                "author": song_author,
                "name": song_name
            })

            # 1. Read the raw chord/lyric file content
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    song_content = f.read()
            except Exception as e:
                print(f"Could not read {filename}: {e}")
                continue

            if is_chordpro:
                song_text = convert_chordpro_to_inline(song_content)
            else:
                song_text = song_content

            # Filter out lines starting with "Capo:" or "Key:"
            cleaned_lines = []
            for line in song_text.splitlines():
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

            # --- Inside your song processing loop ---
            # Assuming 'cleaned_lines' is the list of lines from the previous step

            div_lines = []
            content_started = False

            # --- 1. Pre-process all lines into structured data ---
            processed_lines = []
            content_started = False

            for line in cleaned_lines:
                # Skip initial empty lines of the song
                if not content_started and line.strip() == "":
                    continue
                content_started = True

                # Determine classification
                if is_chord_line(line):
                    line_class = "line chord-line"
                    escaped_text = html.escape(line)
                elif line.strip() == "":
                    line_class = "line empty-line"
                    escaped_text = "&nbsp;"
                else:
                    line_class = "line lyric-line"
                    escaped_text = html.escape(line)

                processed_lines.append({"class": line_class, "text": escaped_text})

            # --- 2. Distribute lines into columns based on your rules ---
            column_count = index_data.get(filename, {}).get("column_count", 1)
            columns = [[] for _ in range(column_count)]
            line_pool = list(processed_lines)

            for i in range(column_count):
                if not line_pool:
                    break

                remaining_cols = column_count - i
                # Calculate an even distribution for the remaining lines
                ideal_chunk_size = math.ceil(len(line_pool) / remaining_cols)

                # Slice the chunk for the current column
                current_chunk = line_pool[:ideal_chunk_size]
                line_pool = line_pool[ideal_chunk_size:]

                # RULE: If a column ends with a chord line, push it to the next column
                if remaining_cols > 1 and current_chunk:
                    if current_chunk[-1]["class"] == "line chord-line":
                        line_pool.insert(0, current_chunk.pop())

                # RULE: If a column starts with an empty line, move it to the previous column
                while current_chunk and current_chunk[0]["class"] == "line empty-line":
                    item = current_chunk.pop(0)
                    if i > 0:
                        columns[i - 1].append(item)
                    # If i == 0, there is no previous column, so it is safely ignored

                columns[i] = current_chunk

            # If any leftover lines remain due to adjustments, append them to the final column
            if line_pool:
                columns[-1].extend(line_pool)

            # Final safety check: Catch any edge cases after pool adjustments
            for i in range(column_count):
                while columns[i] and columns[i][0]["class"] == "line empty-line":
                    item = columns[i].pop(0)
                    if i > 0:
                        columns[i - 1].append(item)

            # --- 3. Generate the HTML Structure ---
            column_divs = []
            for col in columns:
                if not col:
                    continue  # Skip generating empty HTML columns if a song is too short

                col_lines_html = []
                for item in col:
                    col_lines_html.append(
                        f'        <div class="{item["class"]}">{item["text"]}</div>'
                    )

                joined_lines = "\n".join(col_lines_html)
                column_divs.append(f'    <div class="column">\n{joined_lines}\n    </div>')

            # Join all column containers together
            song_divs_html = "\n".join(column_divs)

            # quote_plus turns "Phlake Pregnant" into "Phlake+Pregnant"
            encoded_song_filename = quote_plus(song_filename)

            capo_value = index_data.get(filename, {}).get("capo", 0)

            # Assuming 'capo_value' comes from your JSON index or file parsing
            # This checks if capo_value exists, and ensures it isn't "0", empty, or None
            if capo_value and str(capo_value).strip() not in ["0", "None", ""]:
                capo_text = f"<div id='capo-btn'>capo {capo_value}</div>"
            else:
                capo_text = ""

            # 2. Build the individual song HTML template
            song_html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{song_filename} - Site de Pascal</title>
    <link rel="stylesheet" href="../assets/song.css">
</head>
<body>

    <div class="song-page-container">

        <nav class="song-navbar">
            <div>
                <a href=".." style="color: inherit; text-decoration: none;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Retour
                </a>
            </div>
            <div style="flex-grow: 1;"></div>
            <div><span class="gold">{song_author}</span> - {song_name}</div>
            {capo_text}
            <div style="flex-grow: 1;"></div>
            <div>
                <a href="https://www.youtube.com/results?search_query={encoded_song_filename}" target="_blank">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    Youtube
                </a>
            </div>
        </nav>

        <div style="flex-grow: 1;"></div>

        <div class="song-container">
            {song_divs_html}
        </div>

        <div style="flex-grow: 1;"></div>

    </div>

    <script src="../assets/script.js"></script>
</body>
</html>
"""

            # 3. Write the individual song file to docs/c/
            song_output_path = os.path.join(SONGS_DIR, f"{song_filename}.html")
            with open(song_output_path, "w", encoding="utf-8") as f:
                f.write(song_html)

    # Sort by author name when songs are dictionaries
    songs.sort(key=lambda song: song["author"])

    # 4. Generate the index.html list items
    #list_items = ""
    #for song in songs:
    #    list_items += f'            <li><a href="./c/{song["url"]}.html"><span class="gold">{song["author"]}</span> - {song["name"]}</a></li>\n'
    
    # 4. Generate the index.html list items
    list_items = ""
    for song in songs:
        list_items += f"""            <li>
              <a href="./c/{song["url"]}.html">
                <!-- Left Icon (Star) -->
                <svg class="icon-left" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#E5A93C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="100" height="100">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" fill="#E5A93C" fill-opacity="0.2"/>
                    <circle cx="18" cy="16" r="3" fill="#E5A93C" fill-opacity="0.2"/>
                </svg>

                
                <!-- Center Text -->
                <span class="song-text">
                   <span class="gold">{song["author"]}</span> - {song["name"]}
                </span>
                
                <!-- Right Chevron -->
                <svg class="icon-right" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
            </li>
"""

        

    # 5. Build and write the main index.html page
    index_html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site de Pascal - Accords</title>
    <link rel="stylesheet" href="./assets/index.css">
</head>
<body>

    <nav class="index-navbar">
        <div style="flex: 0 1 12em;"></div>
        <div style="flex: 1 0 auto;"></div>
        <div class="website-title">Site de Pascal - <span class="gold">Accords</span></div>
        <div style="flex: 1 0 auto;"></div>
        <div style="flex-shrink: 0;"><a href="./cheatsheet.html"><img src="./assets/img/book.svg" style="width: 18px; vertical-align: middle;"> Aide-mémoire</a></div>
    </nav>

    <main class="index-content">

        <section class="hero">
            <h1>Bienvenue sur mon site <span class="gold">d'accords</span></h1>
            <p>Consultez des accords de chansons québécoises et internationales</p>

            <div class="search-container">
                <input type="text" id="search-bar" placeholder="Rechercher une chanson...">
            </div>
        </section>

        <section class="song-section">
            <h2>🎵 Chansons</h2>

            <ul class="song-list">
                {list_items}
            </ul>
        </section>
    </main>

    <script src="./assets/index.js"></script>
</body>
</html>
"""

    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        f.write(index_html)

    print(f"Generated {len(songs)} song pages in '{SONGS_DIR}/'")
    print(f"Updated index page at '{INDEX_PATH}'")


if __name__ == "__main__":
    generate_site()