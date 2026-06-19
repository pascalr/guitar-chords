#!/usr/bin/env python3

import json
import math
import os

# Configuration
INDEX_PATH = "./data/index.json"
CHORDS_DIR = "./data/chords"


def calculate_optimal_layout(file_content):
    """Analyzes text to calculate optimal desktop columns and CSS scale factor."""
    # Filter out metadata lines just like the rendering script does
    lines = [
        line
        for line in file_content.splitlines()
        if not (line.lstrip().startswith("Capo:") or line.lstrip().startswith("Key:"))
    ]

    # Strip outer whitespace to get an accurate song body count
    cleaned_text = "\n".join(lines).strip()
    if not cleaned_text:
        return 1, 1.0

    lines = cleaned_text.splitlines()
    line_count = len(lines)

    # Find the character width of the absolute longest line
    max_line_len = max(len(line) for line in lines) if lines else 0

    # --- Heuristics for Desktop Displays ---
    # Assuming a standard monospace font layout
    MAX_DESKTOP_CHAR_WIDTH = 130  # Max character width before horizontal scrolling
    TARGET_LINES_PER_COL = 25  # Ideal max lines per column to prevent vertical scrolling
    COLUMN_GAP_CHARS = 4  # Visual character buffer between columns
    MAX_COLUMNS = 3  # Maximum columns allowed before it looks like a spreadsheet

    # 1. Step down columns based on line count budget
    ideal_columns = max(1, math.ceil(line_count / TARGET_LINES_PER_COL))
    ideal_columns = min(ideal_columns, MAX_COLUMNS)

    # 2. Verify if columns fit horizontally without overlapping
    # Formula: Total Width = (Columns * Max Line Length) + ((Columns - 1) * Gap)
    while ideal_columns > 1:
        total_width = (ideal_columns * max_line_len) + (
            (ideal_columns - 1) * COLUMN_GAP_CHARS
        )
        if total_width <= MAX_DESKTOP_CHAR_WIDTH:
            break
        ideal_columns -= 1  # Push down column count if text overlaps or overflows

    column_count = ideal_columns

    # 3. Calculate Scale Factor if a single column is exceptionally wide
    scale = 1.0
    final_width = (column_count * max_line_len) + (
        (column_count - 1) * COLUMN_GAP_CHARS
    )

    if final_width > MAX_DESKTOP_CHAR_WIDTH:
        # Scale down proportionally to fit the layout screen boundaries
        scale = round(MAX_DESKTOP_CHAR_WIDTH / final_width, 2)
        # Cap minimum scale at 0.75 so chord text stays legible without squinting
        scale = max(0.75, scale)

    return column_count, scale


def main():
    # Load existing index file
    if os.path.exists(INDEX_PATH):
        with open(INDEX_PATH, "r", encoding="utf-8") as f:
            index_data = json.load(f)
    else:
        index_data = {}

    if not os.path.exists(CHORDS_DIR):
        print(f"Error: Chords directory '{CHORDS_DIR}' does not exist.")
        return

    updated_count = 0

    # Scan chord files and update mathematical properties
    for filename in os.listdir(CHORDS_DIR):
        file_path = os.path.join(CHORDS_DIR, filename)

        if os.path.isfile(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
            except Exception as e:
                print(f"Could not read {filename}: {e}")
                continue

            # Calculate math layout properties
            columns, scale = calculate_optimal_layout(content)

            # Ensure the filename key exists in JSON dictionary object
            if filename not in index_data:
                index_data[filename] = {}

            # Inject calculated values
            index_data[filename]["column_count"] = columns
            index_data[filename]["scale"] = scale
            updated_count += 1

    # Save modifications back to index.json
    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump(index_data, f, indent=4, ensure_ascii=False)

    print(
        f"Calculated layout metrics for {updated_count} files inside '{INDEX_PATH}'."
    )


if __name__ == "__main__":
    main()