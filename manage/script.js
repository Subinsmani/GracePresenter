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
        showAddSongFormContainer();
    });

    manageSongsLink.addEventListener('click', function (event) {
        event.preventDefault();
        showManageSongsContainer();
    });

    deleteSongsLink.addEventListener('click', function (event) {
        event.preventDefault();
        contentDiv.innerHTML = '<h2>Delete Songs</h2>';
        // Add delete songs functionality here
    });

    logoutButton.addEventListener('click', function () {
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

    function showAddSongFormContainer() {
        contentDiv.innerHTML = ''; // Clear previous content
        contentDiv.appendChild(addSongFormContainer);
        addSongFormContainer.style.display = 'block';
    }

    function showManageSongsContainer() {
        contentDiv.innerHTML = `
            <h2>Manage Songs</h2>
            <div class="form-group">
                <label for="category">Category:</label>
                <select id="manage-category" name="category" required>
                    <option value="" disabled selected>Loading categories...</option>
                </select>
                <button id="sync-songs-button">Sync Songs</button>
            </div>
        `;
        fetchCategories();

        document.getElementById('sync-songs-button').addEventListener('mouseover', function () {
            this.title = 'Sync the selected category in alphabetical order';
        });

        document.getElementById('sync-songs-button').addEventListener('click', function () {
            const selectedCategory = document.getElementById('manage-category').value;
            if (selectedCategory) {
                syncSongs(selectedCategory);
            } else {
                showDialog('Please select a category to sync songs.', 'OK', 'red');
            }
        });
    }

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
                showDialog(`Songs in category: ${category} have been synchronized in alphabetical order.`, 'OK', 'green');
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
});
