document.addEventListener("DOMContentLoaded", function() {
    const categorySelect = document.getElementById("category");
    const songGroup = document.getElementById("song-group");
    const songSelect = document.getElementById("song");
    const searchInput = document.getElementById("search");
    const searchResults = document.getElementById("search-results");
    const songNotAvailable = document.getElementById("song-not-available");
    const errorMessage = document.getElementById("error-message");
    const errorText = document.getElementById("error-text");
    const lyricsDiv = document.getElementById("primary-lyrics");
    const lyricsText = document.getElementById("lyrics1");
    const lyricsTitle = document.getElementById("lyrics1-title");
    const lyrics2Div = document.getElementById("translate-lyrics");
    const lyrics2Text = document.getElementById("lyrics2");
    const lyrics2Title = document.getElementById("lyrics2-title");
    const songNumberContainer = document.getElementById("song-number-container");
    const songNumberText = document.getElementById("song-number-text");
    const zoomSlider = document.getElementById("zoom-slider");
    const zoomInput = document.getElementById("zoom");
    const translationButtons = document.getElementById("translation-buttons");
    const primaryBtn = document.getElementById("primary-btn");
    const translateBtn = document.getElementById("translate-btn");

    let allSongs = [];
    let globalSongs = [];
    let songNumbers = {};

    if (zoomSlider) zoomSlider.style.display = 'none';
    if (lyricsDiv) lyricsDiv.style.display = 'none';
    if (lyrics2Div) lyrics2Div.style.display = 'none';
    if (translationButtons) translationButtons.style.display = 'none';

    document.querySelector('label[for="search"]').textContent = 'Search Song Globally:';

    fetch('/songs/global')
        .then(response => response.json())
        .then(data => {
            if (!data.error) {
                const categorizedSongs = { English: [], Hindi: [], Malayalam: [] };
                data.songs.forEach((song, index) => {
                    categorizedSongs[song.cat].push({ ...song, number: categorizedSongs[song.cat].length + 1 });
                });
                globalSongs = Object.values(categorizedSongs).flat();
            }
        });

    categorySelect.addEventListener("change", function() {
        const category = this.value;
        searchResults.innerHTML = '';
        searchInput.value = '';

        if (category) {
            fetch(`/songs/${category}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        if (songGroup) songGroup.style.display = "none";
                        if (songNotAvailable) songNotAvailable.style.display = "none";
                        if (errorMessage) {
                            errorMessage.style.display = "block";
                            errorText.textContent = data.error;
                        }
                    } else {
                        if (songSelect) songSelect.innerHTML = '<option value="">--Select Song--</option>';
                        if (data.songs.length > 0) {
                            allSongs = data.songs.map((song, index) => ({
                                ...song,
                                number: index + 1
                            }));
                            songNumbers[category] = allSongs;
                            allSongs.forEach(song => {
                                const option = document.createElement('option');
                                option.value = song.name;
                                option.textContent = `${song.number}. ${song.name}`;
                                if (songSelect) songSelect.appendChild(option);
                            });
                            if (songGroup) songGroup.style.display = "block";
                            if (songNotAvailable) songNotAvailable.style.display = "none";
                            if (errorMessage) errorMessage.style.display = "none";
                        } else {
                            if (songGroup) songGroup.style.display = "none";
                            if (songNotAvailable) songNotAvailable.style.display = "block";
                            if (errorMessage) errorMessage.style.display = "none";
                        }
                    }
                })
                .catch(error => {
                    if (songGroup) songGroup.style.display = "none";
                    if (songNotAvailable) songNotAvailable.style.display = "none";
                    if (errorMessage) {
                        errorMessage.style.display = "block";
                        errorText.textContent = 'An error occurred while fetching songs.';
                    }
                });
        } else {
            if (songGroup) songGroup.style.display = "none";
            if (songNotAvailable) songNotAvailable.style.display = "none";
            if (errorMessage) errorMessage.style.display = "none";
            if (lyricsDiv) lyricsDiv.style.display = "none";
            if (lyrics2Div) lyrics2Div.style.display = "none";
            if (songNumberContainer) songNumberContainer.style.display = "none";
            if (zoomSlider) zoomSlider.style.display = "none";
            if (translationButtons) translationButtons.style.display = "none";
        }

        const searchLabel = category ? 'Search Song:' : 'Search Song Globally:';
        document.querySelector('label[for="search"]').textContent = searchLabel;
    });

    searchInput.addEventListener("input", function() {
        const searchTerm = this.value.toLowerCase();
        searchResults.innerHTML = '';

        const displayResults = results => {
            if (results.length > 0) {
                results.forEach(result => {
                    const listItem = document.createElement("li");
                    listItem.textContent = `${result.number}. ${result.name}`;
                    listItem.addEventListener("click", () => {
                        searchInput.value = result.name;
                        displayLyrics(result.name, categorySelect.value);
                        searchResults.innerHTML = '';
                    });
                    searchResults.appendChild(listItem);
                });
                searchResults.style.display = "block";
            } else {
                searchResults.style.display = "none";
            }
        };

        if (searchTerm) {
            if (categorySelect.value) {
                const categorySongs = songNumbers[categorySelect.value] || [];
                const filteredSongs = categorySongs.filter(song => song.name.toLowerCase().includes(searchTerm));
                displayResults(filteredSongs);
            } else {
                const filteredGlobalSongs = globalSongs.filter(song => song.name.toLowerCase().includes(searchTerm));
                displayResults(filteredGlobalSongs);
            }
        } else {
            searchResults.style.display = "none";
        }
    });

    songSelect.addEventListener("change", function() {
        const songName = this.value.trim();

        if (!songName) {
            return;
        }

        const song = globalSongs.find(song => song.name === songName) || 
                     (categorySelect.value ? songNumbers[categorySelect.value].find(song => song.name === songName) : null);

        if (song) {
            fetchLyrics(song.name, song.number);
        } else {
            if (lyricsDiv) lyricsDiv.style.display = "none";
            if (lyrics2Div) lyrics2Div.style.display = "none";
            if (songNumberContainer) songNumberContainer.style.display = "none";
            if (songNotAvailable) songNotAvailable.style.display = "block";
            if (zoomSlider) zoomSlider.style.display = "none";
            if (translationButtons) translationButtons.style.display = "none";
        }
    });

    function displayLyrics(songName, category) {
        const song = globalSongs.find(song => song.name === songName) || 
                     (category ? songNumbers[category].find(song => song.name === songName) : null);

        if (song) {
            fetchLyrics(song.name, song.number);
        } else {
            if (lyricsDiv) lyricsDiv.style.display = "none";
            if (lyrics2Div) lyrics2Div.style.display = "none";
            if (songNumberContainer) songNumberContainer.style.display = "none";
            if (songNotAvailable) songNotAvailable.style.display = "block";
            if (zoomSlider) zoomSlider.style.display = "none";
            if (translationButtons) translationButtons.style.display = "none";
        }
    }

    function fetchLyrics(songName, songNumber) {
        fetch(`/lyrics/${encodeURIComponent(songName)}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    if (lyricsDiv) lyricsDiv.style.display = "none";
                    if (lyrics2Div) lyrics2Div.style.display = "none";
                    if (songNotAvailable) songNotAvailable.style.display = "block";
                    if (zoomSlider) zoomSlider.style.display = "none";
                    if (translationButtons) translationButtons.style.display = "none";
                } else {
                    if (lyricsTitle) lyricsTitle.textContent = data.name1 || songName;
                    const formattedLyrics = splitLyricsIntoSlides(data.lyrics1);
                    if (lyricsText) lyricsText.innerHTML = formattedLyrics;
                    if (lyricsDiv) lyricsDiv.style.display = "block";

                    if (lyrics2Title) lyrics2Title.textContent = data.name2 || songName;
                    if (data.lyrics2 && !isOnlyTags(data.lyrics2)) {
                        const formattedLyrics2 = splitLyricsIntoSlides(data.lyrics2);
                        if (lyrics2Text) lyrics2Text.innerHTML = formattedLyrics2;
                        if (lyrics2Div) lyrics2Div.style.display = "block";
                    } else {
                        if (lyrics2Div) lyrics2Div.style.display = "none";
                    }

                    addSlideClickListeners();

                    if (songNumberContainer) {
                        songNumberContainer.style.display = "block";
                        songNumberText.textContent = `Song Number: ${songNumber}`;
                    }

                    if (songNotAvailable) songNotAvailable.style.display = "none";
                    if (zoomSlider) zoomSlider.style.display = "block";
                    if (window.innerWidth <= 768) {
                        translationButtons.style.display = data.lyrics2 ? "flex" : "none";
                        if (primaryBtn) primaryBtn.classList.add("active");
                        if (translateBtn) translateBtn.classList.remove("active");
                        if (lyricsDiv) lyricsDiv.style.display = "block";
                        if (lyrics2Div) lyrics2Div.style.display = "none";
                    } else {
                        translationButtons.style.display = "none";
                    }
                }
            })
            .catch(error => {
                if (lyricsDiv) lyricsDiv.style.display = "none";
                if (lyrics2Div) lyrics2Div.style.display = "none";
                if (songNumberContainer) songNumberContainer.style.display = "none";
                if (songNotAvailable) songNotAvailable.style.display = "block";
                if (zoomSlider) zoomSlider.style.display = "none";
                if (translationButtons) translationButtons.style.display = "none";
            });
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function splitLyricsIntoSlides(lyrics) {
        const slides = lyrics.split('<slide>').map((slide, index) => {
            return `<div class="slide" data-slide="${index + 1}">${escapeHtml(slide.trim()).replace(/&lt;BR&gt;/g, '<br>').replace(/&lt;br&gt;/g, '<br>').replace(/&lt;br\/&gt;/g, '<br>').replace(/<br>/g, '<br>').replace(/<br\/>/g, '<br>')}</div>`;
        });
        return slides.join('');
    }

    function isOnlyTags(lyrics) {
        const strippedLyrics = lyrics.replace(/<BR>/g, '').replace(/<slide>/g, '').trim();
        return strippedLyrics.length === 0;
    }

    if (zoomInput) {
        zoomInput.addEventListener("input", applyZoom);
    }

    function applyZoom() {
        const zoomLevel = zoomInput.value;
        if (lyricsText) lyricsText.style.fontSize = `${zoomLevel}%`;
        if (lyrics2Text) lyrics2Text.style.fontSize = `${zoomLevel}%`;
    }

    if (primaryBtn) {
        primaryBtn.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                if (lyricsDiv) lyricsDiv.style.display = "block";
                if (lyrics2Div) lyrics2Div.style.display = "none";
                primaryBtn.classList.add("active");
                translateBtn.classList.remove("active");
            }
        });
    }

    if (translateBtn) {
        translateBtn.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                if (lyricsDiv) lyricsDiv.style.display = "none";
                if (lyrics2Div) lyrics2Div.style.display = "block";
                primaryBtn.classList.remove("active");
                translateBtn.classList.add("active");
            }
        });
    }

    function addSlideClickListeners() {
        const slides1 = document.querySelectorAll('#primary-lyrics .slide');
        const slides2 = document.querySelectorAll('#translate-lyrics .slide');
        slides1.forEach((slide, index) => {
            slide.addEventListener('click', () => {
                slides1.forEach(s => s.classList.remove('highlight'));
                slides2.forEach(s => s.classList.remove('highlight'));
                slide.classList.add('highlight');
                if (slides2[index]) {
                    slides2[index].classList.add('highlight');
                }
            });
        });
    }

    // Ensure translation buttons are hidden initially
    translationButtons.style.display = 'none';
});
