document.addEventListener('DOMContentLoaded', function () {
    const manageCategorySelect = document.getElementById('manage-category');
    const songSelect = document.getElementById('song');
    const syncSongsButton = document.getElementById('sync-songs-button');

    manageCategorySelect.addEventListener('change', function () {
        const category = manageCategorySelect.value;
        fetchSongsByCategory(category);
        document.querySelector('.song-name-container').style.display = 'none';
        clearLyrics();
    });

    songSelect.addEventListener('change', function () {
        const selectedSong = this.value;
        fetchSongDetails(selectedSong);
    });

    syncSongsButton.addEventListener('click', function () {
        const category = manageCategorySelect.value;
        syncSongs(category);
    });

    fetchCategories();

    document.getElementById('logout-button').addEventListener('click', function () {
        fetch('/manage/logout')
            .then(response => {
                if (response.ok) {
                    window.location.href = '/manage/login.html';
                } else {
                    console.error('Logout failed');
                }
            })
            .catch(error => {
                console.error('Error during logout:', error);
            });
    });
});

function fetchCategories() {
    fetch('/manage/get-categories')
        .then(response => response.json())
        .then(categories => {
            const categorySelect = document.getElementById('manage-category');
            categorySelect.innerHTML = '<option value="" disabled selected>Select the category</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
        });
}

function fetchSongsByCategory(category) {
    fetch(`/manage/get-songs?category=${category}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(songs => {
            const songSelect = document.getElementById('song');
            songSelect.innerHTML = '<option value="" disabled selected>--Select Song--</option>';
            songs.forEach(song => {
                const option = document.createElement('option');
                option.value = song.name;
                option.textContent = song.name;
                songSelect.appendChild(option);
            });
            document.querySelector('.song-name-container').style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching songs:', error);
        });
}

function fetchSongDetails(songName) {
    fetch(`/manage/get-song-details?song=${songName}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            populateLyrics(data);
        })
        .catch(error => {
            console.error('Error fetching song details:', error);
        });
}

function populateLyrics(data) {
    const lyrics1Title = document.getElementById('lyrics1-title');
    const lyrics2Title = document.getElementById('lyrics2-title');

    lyrics1Title.value = data.name1 || '';
    lyrics2Title.value = data.name2 || '';

    const lyrics1Container = document.querySelector('.lyrics-container1');
    const lyrics2Container = document.querySelector('.lyrics-container2');

    lyrics1Container.innerHTML = '<label for="lyrics1-title">Original Lyrics Title:</label><input type="text" id="lyrics1-title" name="lyrics1-title" value="' + data.name1 + '"><label for="lyrics1">Original Lyrics:</label>';
    lyrics2Container.innerHTML = '<label for="lyrics2-title">Translate Lyrics Title:</label><input type="text" id="lyrics2-title" name="lyrics2-title" value="' + data.name2 + '"><label for="lyrics2">Translated Lyrics:</label>';

    const lyrics1Array = data.lyrics1.split('<slide>').filter(lyric => lyric.trim() !== '');
    const lyrics2Array = data.lyrics2.split('<slide>').filter(lyric => lyric.trim() !== '');

    lyrics1Array.forEach((lyric, index) => {
        const textarea = document.createElement('textarea');
        textarea.name = `lyrics1-${index + 1}`;
        textarea.rows = 4;
        textarea.style.minHeight = '100px';
        textarea.value = lyric.replace(/<br>/g, '\n');
        lyrics1Container.appendChild(textarea);
    });

    lyrics2Array.forEach((lyric, index) => {
        const textarea = document.createElement('textarea');
        textarea.name = `lyrics2-${index + 1}`;
        textarea.rows = 4;
        textarea.style.minHeight = '100px';
        textarea.value = lyric.replace(/<br>/g, '\n');
        lyrics2Container.appendChild(textarea);
    });

    document.querySelector('.lyrics-container1').style.display = 'block';
    document.querySelector('.lyrics-container2').style.display = data.lyrics2 ? 'block' : 'none';
}

function syncSongs(category) {
    fetch('/manage/sort-songs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showDialog('Songs sorted and IDs updated successfully.', 'OK', 'green');
        } else {
            showDialog(`Error: ${data.message}`, 'Go Back', 'red');
        }
    })
    .catch(error => {
        showDialog(`Error: ${error.message}`, 'Go Back', 'red');
    });
}

function showDialog(message, buttonText, buttonColor) {
    const dialog = document.createElement('div');
    dialog.id = 'dialog';
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.backgroundColor = 'white';
    dialog.style.padding = '20px';
    dialog.style.border = '1px solid #ccc';
    dialog.style.borderRadius = '10px';
    dialog.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.2)';
    dialog.style.zIndex = '1000';
    dialog.style.textAlign = 'center';

    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    dialog.appendChild(messageElement);

    const button = document.createElement('button');
    button.textContent = buttonText;
    button.style.backgroundColor = buttonColor;
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.padding = '10px 20px';
    button.style.cursor = 'pointer';
    button.addEventListener('click', function () {
        document.body.removeChild(dialog);
    });

    dialog.appendChild(button);
    document.body.appendChild(dialog);
}

function clearLyrics() {
    document.querySelector('.lyrics-container1').style.display = 'none';
    document.querySelector('.lyrics-container2').style.display = 'none';
    document.getElementById('lyrics1-title').value = '';
    document.getElementById('lyrics2-title').value = '';
}
