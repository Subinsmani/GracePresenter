document.addEventListener('DOMContentLoaded', function () {
    const addNewSongsLink = document.getElementById('add-new-songs');
    const manageSongsLink = document.getElementById('manage-songs');
    const deleteSongsLink = document.getElementById('delete-songs');
    const logoutButton = document.getElementById('logout-button');
    const contentDiv = document.getElementById('content');
    const addSongFormContainer = document.getElementById('add-song-form-container');

    // Check if the session has expired
    const sessionExpiration = localStorage.getItem('sessionExpiration');
    if (sessionExpiration && new Date().getTime() > sessionExpiration) {
        logout();
    }

    addNewSongsLink.addEventListener('click', function (event) {
        event.preventDefault();
        addSongFormContainer.style.display = 'block';
    });

    manageSongsLink.addEventListener('click', function (event) {
        event.preventDefault();
        contentDiv.innerHTML = '<h2>Manage Songs</h2>';
        // Add manage songs functionality here
    });

    deleteSongsLink.addEventListener('click', function (event) {
        event.preventDefault();
        contentDiv.innerHTML = '<h2>Delete Songs</h2>';
        // Add delete songs functionality here
    });

    logoutButton.addEventListener('click', function () {
        logout();
    });

    function setupCategoryListener() {
        const categorySelect = document.getElementById('category');
        const hasTranslationGroup = document.getElementById('has-translation-group');
        const songNameContainer = document.querySelector('.song-name-container');
        const lyricsContainer1 = document.querySelector('.lyrics-container1');
        const lyricsContainer2 = document.querySelector('.lyrics-container2');
        const submitButton = document.getElementById('submit-song');
        const hasTranslationSelect = document.getElementById('has-translation');

        categorySelect.addEventListener('change', function () {
            if (categorySelect.value) {
                hasTranslationGroup.style.display = 'block';
                songNameContainer.style.display = 'flex';
                lyricsContainer1.style.display = 'block';
                submitButton.style.display = 'block';
            } else {
                hasTranslationGroup.style.display = 'none';
                songNameContainer.style.display = 'none';
                lyricsContainer1.style.display = 'none';
                lyricsContainer2.style.display = 'none';
                submitButton.style.display = 'none';
            }
        });

        hasTranslationSelect.addEventListener('change', function () {
            if (hasTranslationSelect.value === 'yes') {
                lyricsContainer2.style.display = 'block';
            } else {
                lyricsContainer2.style.display = 'none';
            }
        });
    }

    function addLyricsInputHandlers() {
        document.querySelectorAll('.add-lyrics').forEach(button => {
            button.addEventListener('click', function () {
                const originalContainer = this.previousElementSibling;
                const translatedContainer = document.querySelector('.lyrics2-container');

                const newOriginalContainer = document.createElement('div');
                newOriginalContainer.className = 'lyrics1-container';

                const newOriginalTextArea = document.createElement('textarea');
                newOriginalTextArea.rows = 4;
                newOriginalTextArea.className = 'lyrics1';
                newOriginalTextArea.name = 'lyrics1';
                newOriginalTextArea.style.minHeight = '100px';
                newOriginalContainer.appendChild(newOriginalTextArea);

                const newOriginalRemoveButton = document.createElement('button');
                newOriginalRemoveButton.type = 'button';
                newOriginalRemoveButton.className = 'remove-lyrics';
                newOriginalRemoveButton.textContent = '-';
                newOriginalContainer.appendChild(newOriginalRemoveButton);

                originalContainer.parentElement.insertBefore(newOriginalContainer, this);

                const newTranslatedTextArea = document.createElement('textarea');
                newTranslatedTextArea.rows = 4;
                newTranslatedTextArea.className = 'lyrics2';
                newTranslatedTextArea.name = 'lyrics2';
                newTranslatedTextArea.style.minHeight = '100px';
                translatedContainer.appendChild(newTranslatedTextArea);

                newOriginalRemoveButton.addEventListener('click', function () {
                    newOriginalContainer.remove();
                    newTranslatedTextArea.remove();
                });

                autoResizeTextArea(newOriginalTextArea);
                autoResizeTextArea(newTranslatedTextArea);
            });
        });
    }

    function autoResizeTextArea() {
        const textareas = document.querySelectorAll('.lyrics1, .lyrics2');
        textareas.forEach(textarea => {
            textarea.style.overflow = 'hidden';
            textarea.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
            textarea.dispatchEvent(new Event('input'));
        });
    }

    function logout() {
        // Clear session
        localStorage.removeItem('sessionExpiration');
        // Redirect to login page
        window.location.href = '/manage/login.html';
    }

    // Set session expiration to 24 hours
    const sessionDuration = 24 * 60 * 60 * 1000;
    const now = new Date().getTime();
    localStorage.setItem('sessionExpiration', now + sessionDuration);

    // Initialize listeners
    setupCategoryListener();
    addLyricsInputHandlers();
});
