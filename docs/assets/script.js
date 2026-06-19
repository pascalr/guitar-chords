document.addEventListener("DOMContentLoaded", () => {
    const capoBtn = document.getElementById("capo-btn");
    
    // Target the song container holding our data-capo attribute
    const songContainer = document.querySelector(".song-container");

    if (!capoBtn || !songContainer) return;

    capoBtn.addEventListener("click", () => {

        // 1. Extract the number from the button text (e.g., "(capo 2)")
        const match = capoBtn.textContent.match(/\d+/);
        const capoValue = match ? parseInt(match[0], 10) : 0;
        
        // If there is no capo, or it's already been neutralized, exit early
        if (!capoValue || capoValue === 0) {
            console.log("No capo transposition needed.");
            return;
        }

        // 2. Query all chord line divs
        const chordLines = document.querySelectorAll("div.chord-line");

        chordLines.forEach((line) => {
            // Read raw text layout safely
            const originalText = line.textContent;
            
            // Split line by spaces while capturing the spaces inside the array
            // Example: "Am   F" becomes ["Am", "   ", "F"]
            const tokens = originalText.split(/(\s+)/);
            let delta = 0; // Tracks character length changes to adjust spaces

            for (let i = 0; i < tokens.length; i++) {
                if (tokens[i].trim() === "") {
                    // This token is a block of spaces
                    if (delta !== 0) {
                        let originalSpaceLength = tokens[i].length;
                        let newSpaceCount = originalSpaceLength - delta;

                        if (newSpaceCount < 1) {
                            // If the chord grew too much, leave 1 safety space 
                            // and carry over the remaining delta to the next space block
                            delta = delta - (originalSpaceLength - 1);
                            newSpaceCount = 1;
                        } else {
                            delta = 0; // Delta fully absorbed
                        }
                        tokens[i] = " ".repeat(newSpaceCount);
                    }
                } else {
                    // This token is a chord (e.g., "Am", "(A#)x4", "C/E")
                    // Skip standalone multipliers like "x4"
                    if (/^[xX]\d+$/.test(tokens[i])) continue;

                    const originalLength = tokens[i].length;
                    const transposedChord = transposeChord(tokens[i], capoValue);
                    
                    tokens[i] = transposedChord;
                    // Calculate how much wider or narrower the string became
                    delta += (transposedChord.length - originalLength);
                }
            }

            // Write the newly aligned string back into the DOM element
            line.textContent = tokens.join("");
        });

        // 3. Update UI states so it can't be double-transposed accidentally
        songContainer.dataset.capo = "0"; 
        capoBtn.disabled = true;
        capoBtn.textContent = "(sans Capo)";
        
        // Optional: Update your navbar text if you have a capo status display
        const statusDiv = document.querySelector(".song-navbar div:nth-child(3)");
        if (statusDiv) statusDiv.textContent = "Sans capo";
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
    let newIndex = (index + semitones) % 12;
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