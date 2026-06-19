#!/usr/bin/env python3

import json
import os
from pathlib import Path

# Configuration
INDEX_PATH = "./data/index.json"
CHORDS_DIR = "./data/chords"


def update_index():
    # Ensure the directory for index.json exists
    os.makedirs(os.path.dirname(INDEX_PATH), exist_ok=True)

    # 1. Load existing index or initialize an empty dictionary
    if os.path.exists(INDEX_PATH):
        try:
            with open(INDEX_PATH, "r", encoding="utf-8") as f:
                index_data = json.load(f)
        except json.JSONDecodeError:
            print(f"Warning: {INDEX_PATH} was corrupted or empty. Initializing new index.")
            index_data = {}
    else:
        index_data = {}

    if not os.path.exists(CHORDS_DIR):
        print(f"Error: Chords directory '{CHORDS_DIR}' does not exist.")
        return

    has_updates = False

    # 2. Scan the chords directory
    for filename in os.listdir(CHORDS_DIR):
        file_path = os.path.join(CHORDS_DIR, filename)

        # Ensure it's a file and check if it's already indexed
        if os.path.isfile(file_path):
            if filename in index_data:
                # Skip if already exists in the index
                continue

            print(f"Found new file, extracting metadata: {filename}")
            has_updates = True

            # 3. Extract Author and Song Name from filename convention
            stem = Path(filename).stem  # Removes the extension (.txt, etc.)
            if "-" in stem:
                # Split by the first occurrence of the minus sign
                author_part, name_part = stem.split("-", 1)
                author = author_part.strip()
                name = name_part.strip()
            else:
                author = "Unknown"
                name = stem.strip()

            # Initialize properties
            capo_value = None
            key_value = None

            # 4. Parse the file lines for "Capo:" and "Key:"
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line_stripped = line.strip()
                        
                        if line_stripped.startswith("Capo:"):
                            # Extract everything after "Capo:" and strip spaces
                            capo_value = line_stripped[len("Capo:"):].strip()
                            
                        elif line_stripped.startswith("Key:"):
                            # Extract everything after "Key:" and strip spaces
                            key_value = line_stripped[len("Key:"):].strip()
            except Exception as e:
                print(f"Error reading contents of {filename}: {e}")
                continue

            # 5. Add the metadata payload to the index object
            index_data[filename] = {
                "author": author,
                "name": name,
                "capo": capo_value,
                "key": key_value
            }

    # 6. Save back to index.json if modifications occurred
    if has_updates:
        with open(INDEX_PATH, "w", encoding="utf-8") as f:
            # ensure_ascii=False preserves accents like é, à, ç, etc.
            json.dump(index_data, f, indent=4, ensure_ascii=False, sort_keys=True)
        print(f"Successfully updated {INDEX_PATH}")
    else:
        print("No new chord files detected. Index is up to date.")


if __name__ == "__main__":
    update_index()