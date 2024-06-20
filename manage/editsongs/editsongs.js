document.addEventListener('DOMContentLoaded', function () {
    const manageSongsLink = document.getElementById('manage-songs');
    const syncSongsButton = document.getElementById('sync-songs-button');
    const manageCategorySelect = document.getElementById('manage-category');

    if (manageSongsLink) {
        manageSongsLink.addEventListener('click', function (event) {
            event.preventDefault();
            showManageSongFormContainer();
        });
    }

    if (syncSongsButton) {
        syncSongsButton.addEventListener('click', function (event) {
            event.preventDefault();
            const category = manageCategorySelect.value;
            syncSongs(category);
        });
    }

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

function showManageSongFormContainer() {
    const manageSongFormContainer = document.getElementById('manage-song-form-container');
    if (manageSongFormContainer) {
        manageSongFormContainer.style.display = 'block';
    }
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
