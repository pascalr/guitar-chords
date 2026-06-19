document.addEventListener("DOMContentLoaded", () => {
    const capoBtn = document.getElementById("capo-btn");
    const songContainer = document.querySelector(".song-container");

    if (!capoBtn || !songContainer) return;

    // 1. Read the initial value and text ONCE when the page loads
    const match = capoBtn.textContent.match(/\d+/);
    const capoValue = match ? parseInt(match[0], 10) : 0;
    
    if (capoValue === 0) return; // Exit if no capo is required

    const originalBtnText = capoBtn.textContent; // Save initial layout text (e.g. "(capo 2)")
    capoBtn.dataset.state = "original";         // Track if state is "original" or "transposed"

    capoBtn.addEventListener("click", () => {
        const currentState = capoBtn.dataset.state;
        const chordLines = document.querySelectorAll("div.chord-line");
        
        // Determine math direction: 
        // Going to sans capo? Shift UP (+capoValue). Returning to capo? Shift DOWN (-capoValue).
        const semitones = currentState === "original" ? capoValue : -capoValue;

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
    
    // Handle slash chords/compound bass notes (e.g., C/E -> D/F#)
    if (remainder.includes("/")) {
        const parts = remainder.split("/");
        const bassMatch = parts[1].match(/^([A-G][b#]?)/);
        if (bassMatch) {
            let bassRoot = bassMatch[1];
            const bassRemainder = parts[1].slice(bassRoot.length);
            
            if (normalize[bassRoot]) bassRoot = normalize[bassRoot];
            let bassIndex = scale.indexOf(bassRoot);
            if (bassIndex !== -1) {
                let newBassIndex = (bassIndex + semitones) % 12;
                parts[1] = scale[newBassIndex] + bassRemainder;
            }
        }
        remainder = parts[0] + "/" + parts[1];
    }
    
    return prefix + newRoot + remainder + suffix;
}