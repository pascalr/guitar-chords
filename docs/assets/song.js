document.addEventListener("DOMContentLoaded", () => {
    handleCapoButtonClick();
    handleKeyHover();
});

function handleCapoButtonClick() {
    const capoBtn = document.getElementById("capo-btn");
    const songContainer = document.querySelector(".song-container");

    if (!capoBtn || !songContainer) return;

    // capoValue must be given in the javascript inline of the song
    if (capoValue === 0) return; // Exit if no capo is required

    const originalBtnText = capoBtn.textContent; // Save initial layout text (e.g. "(capo 2)")
    capoBtn.dataset.state = "original";         // Track if state is "original" or "transposed"

    capoBtn.addEventListener("click", () => {
        const currentState = capoBtn.dataset.state;
        const chordLines = document.querySelectorAll("div.chord-line");
        const tabLines = document.querySelectorAll("div.tab-line");
        
        // Determine math direction: 
        // Going to sans capo? Shift UP (+capoValue). Returning to capo? Shift DOWN (-capoValue).
        const semitones = currentState === "original" ? capoValue : -capoValue;

        tabLines.forEach((line) => {
            const originalText = line.textContent;
            line.textContent = transposeTabLine(originalText, semitones);
        });

        chordLines.forEach((line) => {
            const originalText = line.textContent;
            const tokens = originalText.split(/(\s+)/);
            let delta = 0;

            for (let i = 0; i < tokens.length; i++) {
                if (tokens[i].trim() === "") {
                    if (delta !== 0) {
                        let originalSpaceLength = tokens[i].length;
                        let newSpaceCount = originalSpaceLength - delta;

                        if (newSpaceCount < 1) {
                            delta = delta - (originalSpaceLength - 1);
                            newSpaceCount = 1;
                        } else {
                            delta = 0;
                        }
                        tokens[i] = " ".repeat(newSpaceCount);
                    }
                } else {
                    if (/^[xX]\d+$/.test(tokens[i])) continue;

                    const originalLength = tokens[i].length;
                    const transposedChord = transposeChord(tokens[i], semitones);
                    
                    tokens[i] = transposedChord;
                    delta += (transposedChord.length - originalLength);
                }
            }
            line.textContent = tokens.join("");
        });

        if (currentState === "original") {
            capoBtn.dataset.state = "transposed";
            capoBtn.textContent = "sans capo"; 
            capoBtn.style.color = "white"; // Changes text color to white
        } else {
            capoBtn.dataset.state = "original";
            capoBtn.textContent = originalBtnText; // Restores original "(capo X)" string layout
            capoBtn.style.color = "";      // Clears inline style, falling back to your red CSS default
        }
    });

    capoBtn.click();
}

function handleKeyHover() {
    const majorScales = {
        "C":  ["C", "D", "E", "F", "G", "A", "B"],
        "Db": ["D", "E♭", "F", "G♭", "A♭", "B♭", "C"],
        "D":  ["D", "E", "F♯", "G", "A", "B", "C♯"],
        "Eb": ["E♭", "F", "G", "A♭", "B♭", "C", "D"],
        "E":  ["E", "F♯", "G♯", "A", "B", "C♯", "D♯"],
        "F":  ["F", "G", "A", "B♭", "C", "D", "E"],
        "Gb": ["G♭", "A♭", "B♭", "C♭", "D♭", "E♭", "F"],
        "G":  ["G", "A", "B", "C", "D", "E", "F♯"],
        "Ab": ["A♭", "B♭", "C", "D♭", "E♭", "F", "G"],
        "A":  ["A", "B", "C♯", "D", "E", "F♯", "G♯"],
        "Bb": ["B♭", "C", "D", "E♭", "F", "G", "A"],
        "B":  ["B", "C♯", "D♯", "E", "F♯", "G♯", "A♯"]
    };

    const minorScales = {
        "Am": ["A", "B", "C", "D", "E", "F", "G"],
        "Bbm": ["B♭", "C", "D♭", "E♭", "F", "G♭", "A♭"],
        "Bm": ["B", "C♯", "D", "E", "F♯", "G", "A"],
        "Cm": ["C", "D", "E♭", "F", "G", "A♭", "B♭"],
        "C#m": ["C♯", "D♯", "E", "F♯", "G♯", "A", "B"],
        "Dm": ["D", "E", "F", "G", "A", "B♭", "C"],
        "Ebm": ["E♭", "F", "G♭", "A♭", "B♭", "C♭", "D♭"],
        "Em": ["E", "F♯", "G", "A", "B", "C", "D"],
        "Fm": ["F", "G", "A♭", "B♭", "C", "D♭", "E♭"],
        "F#m": ["F♯", "G♯", "A", "B", "C♯", "D", "E"],
        "Gm": ["G", "A", "B♭", "C", "D", "E♭", "F"],
        "G#m": ["G♯", "A♯", "B", "C♯", "D♯", "E", "F♯"]
    };

    const scales = {...majorScales, ...minorScales};

    const keyElement = document.getElementById("song-key");

    const popup = document.createElement("div");
    popup.id = "key-popup";
    popup.style.cssText = `
        position: absolute;
        display: none;
        background: white;
        color: black;
        font-size: 1.5em;
        border: 1px solid #ccc;
        padding: 8px;
        border-radius: 4px;
        box-shadow: 0 2px 6px rgba(0,0,0,.2);
        z-index: 1000;
    `;

    document.body.appendChild(popup);

    keyElement.addEventListener("mouseenter", () => {
    const key = keyElement.textContent.trim();
    const notes = scales[key];

    if (notes) {
        popup.textContent = notes.join("  ");

        const rect = keyElement.getBoundingClientRect();
        popup.style.left = `${rect.left + window.scrollX}px`;
        popup.style.top = `${rect.bottom + window.scrollY + 5}px`;
        popup.style.display = "block";
    }
    });

    keyElement.addEventListener("mouseleave", () => {
        popup.style.display = "none";
    });
}

/**
 * Transposes an individual chord string up by a set number of semitones
 * while preserving parentheses, modifiers, and slash-bass notes.
 */
function transposeChord(chord, semitones) {
    // 1. Map all possible notes to their numeric chromatic index (0-11)
    const noteToId = {
        "C": 0,  "C#": 1,  "Db": 1,  "D": 2,  "D#": 3,  "Eb": 3,
        "E": 4,  "F": 5,   "F#": 6,  "Gb": 6, "G": 7,   "G#": 8,
        "Ab": 8, "A": 9,   "A#": 10, "Bb": 10, "B": 11
    };

    let scale = [];
    const SHARP_KEYS = ["G", "D", "A", "E", "B", "F#", "C#", "Em", "Bm", "F#m", "C#m"];
    
    if (!songKey || SHARP_KEYS.includes(songKey)) {
        scale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    } else {
        scale = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    }
    
    let prefix = "";
    let suffix = "";
    let core = chord;
    
    if (core.startsWith("(")) {
        prefix = "(";
        core = core.slice(1);
    }
    
    const xMatch = core.match(/([xX]\d+)\)?$/);
    if (xMatch) {
        suffix = xMatch[1] + suffix;
        core = core.slice(0, -xMatch[1].length);
    }
    if (core.endsWith(")")) {
        suffix = ")" + suffix;
        core = core.slice(0, -1);
    }

    const rootMatch = core.match(/^([A-G][b#]?)/);
    if (!rootMatch) return chord; 
    
    let root = rootMatch[1];
    let remainder = core.slice(root.length);
    
    // 2. Look up index via the universal map (Safe for both sharp and flat inputs)
    if (!(root in noteToId)) return chord;
    let index = noteToId[root];
    
    let newIndex = ((index + semitones) % 12 + 12) % 12;
    let newRoot = scale[newIndex];
    
    if (remainder.includes("/")) {
        const parts = remainder.split("/");
        const bassMatch = parts[1].match(/^([A-G][b#]?)/);
        
        if (bassMatch) {
            let bassRoot = bassMatch[1];
            let bassRemainder = parts[1].slice(bassRoot.length);

            // 3. Apply the same safe map logic to the bass note
            if (bassRoot in noteToId) {
                let bassIndex = noteToId[bassRoot];
                let newBassIndex = ((bassIndex + semitones) % 12 + 12) % 12;
                parts[1] = scale[newBassIndex] + bassRemainder;
            }
        }
        remainder = parts[0] + "/" + parts[1];
    }
    
    return prefix + newRoot + remainder + suffix;
}

function transposeTabLine(text, semitones) {
    // Replace numbers in guitar tabs (supports multi-digit frets)
    return text.replace(/\d+/g, (match) => {
        const num = parseInt(match, 10);
        const shifted = num + semitones;

        // Keep fret numbers valid (no negatives)
        return shifted >= 0 ? String(shifted) : "0";
    });
}