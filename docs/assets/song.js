document.addEventListener("DOMContentLoaded", () => {
    const capoBtn = document.getElementById("capo-btn");
    const songContainer = document.querySelector(".song-container");

    if (!capoBtn || !songContainer) return;

    // 1. Read the initial value and text ONCE when the page loads
    // Map of Roman numerals to integers for quick lookup
    const romanMap = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12 };

    // 1. Extract the Roman numeral token (matches any combination of I, V, or X)
    const match = capoBtn.textContent.match(/[IVX]+/i);
    
    // 2. Convert it to an integer, defaulting to 0 if no Roman numeral is found
    const capoValue = match ? (romanMap[match[0].toUpperCase()] || 0) : 0;
    
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
});

/**
 * Transposes an individual chord string up by a set number of semitones
 * while preserving parentheses, modifiers, and slash-bass notes.
 */
function transposeChord(chord, semitones) {
    const scale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const normalize = { "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#" };
    
    let prefix = "";
    let suffix = "";
    let core = chord;
    
    // Strip and save structural parenthesis/multipliers wrappers
    if (core.startsWith("(")) {
        prefix = "(";
        core = core.slice(1);
    }
    
    // Handle trailing multipliers like )x4 or x4
    const xMatch = core.match(/([xX]\d+)\)?$/);
    if (xMatch) {
        suffix = xMatch[1] + suffix;
        core = core.slice(0, -xMatch[1].length);
    }
    if (core.endsWith(")")) {
        suffix = ")" + suffix;
        core = core.slice(0, -1);
    }

    // Extract the musical root note root (e.g., "F#", "Bb", "A")
    const rootMatch = core.match(/^([A-G][b#]?)/);
    if (!rootMatch) return chord; 
    
    let root = rootMatch[1];
    let remainder = core.slice(root.length);
    
    if (normalize[root]) root = normalize[root];
    let index = scale.indexOf(root);
    if (index === -1) return chord;
    
    // Transpose root up
    let newIndex = ((index + semitones) % 12 + 12) % 12;
    let newRoot = scale[newIndex];
    
    // Handle slash chords safely
    if (remainder.includes("/")) {
        const parts = remainder.split("/");

        const bassMatch = parts[1].match(/^([A-G][b#]?)/);
        if (bassMatch) {
            let bassRoot = bassMatch[1];
            let bassRemainder = parts[1].slice(bassRoot.length);

            if (normalize[bassRoot]) bassRoot = normalize[bassRoot];

            let bassIndex = scale.indexOf(bassRoot);

            if (bassIndex !== -1) {
                let newBassIndex = ((bassIndex + semitones) % 12 + 12) % 12;
                let newBass = scale[newBassIndex];

                parts[1] = newBass + bassRemainder;
            } else {
                // ⚠️ fallback: do NOT corrupt chord
                parts[1] = parts[1];
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