document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('search-bar');
    const songList = document.querySelector('.song-list');
    
    // Safety check in case the search bar isn't on the current page
    if (!searchBar || !songList) return;

    const songItems = songList.getElementsByTagName('li');

    // Helper function to remove accents and lowercase the text
    const cleanText = (text) => {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    };

    searchBar.addEventListener('input', (e) => {
        const searchTerm = cleanText(e.target.value);

        for (let i = 0; i < songItems.length; i++) {
            const item = songItems[i];
            // Get the text inside the anchor tag
            const songName = item.textContent || item.innerText;
            const cleanSongName = cleanText(songName);

            if (cleanSongName.includes(searchTerm)) {
                item.style.display = ""; // Show item
            } else {
                item.style.display = "none"; // Hide item
            }
        }
    });
});