document.addEventListener('DOMContentLoaded', function () {
    fetchCategories();

    document.getElementById('add-new-songs').addEventListener('click', function (event) {
        event.preventDefault();
        showAddSongFormContainer();
    });

    document.getElementById('add-song-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const songName = document.getElementById('song-name').value;
        const lyrics1Title = document.getElementById('lyrics1-title').value;
        const lyrics2Title = document.getElementById('lyrics2-title').value;
        const category = document.getElementById('category').value;
        const lyrics1 = processLyrics(document.querySelectorAll('.lyrics1'));

        const hasTranslation = document.getElementById('has-translation').value;
        let lyrics2 = '';
        if (hasTranslation === 'yes') {
            lyrics2 = processLyrics(document.querySelectorAll('.lyrics2'));
        }

        const songData = {
            songName,
            lyrics1Title,
            lyrics2Title,
            category,
            lyrics1,
            lyrics2
        };

        fetch('/manage/add-song', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(songData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                clearForm();
                showDialog(`Added Song Name: ${songName} to the database successfully`, 'OK', 'green');
            } else {
                showDialog(`Error: ${data.message}`, 'Go Back', 'red');
            }
        })
        .catch(error => {
            showDialog(`Error: ${error.message}`, 'Go Back', 'red');
        });
    });
});

function fetchCategories() {
    fetch('/manage/get-categories')
        .then(response => response.json())
        .then(categories => {
            const categorySelect = document.getElementById('category');
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

function processLyrics(textareas) {
    let processedLyrics = '';
    textareas.forEach(textarea => {
        const content = textarea.value.replace(/\n/g, '<br>');
        processedLyrics += `<slide>${content}<slide>`;
    });
    return processedLyrics;
}

function clearForm() {
    document.getElementById('add-song-form').reset();
    document.getElementById('has-translation-group').style.display = 'none';
    document.querySelector('.song-name-container').style.display = 'none';
    document.querySelector('.lyrics-container1').style.display = 'none';
    document.querySelector('.lyrics-container2').style.display = 'none';
    document.getElementById('submit-song').style.display = 'none';
    document.getElementById('import-button').style.display = 'none';
}

function showAddSongFormContainer() {
    document.getElementById('add-song-form-container').style.display = 'block';
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
        if (buttonColor === 'green') {
            document.getElementById('add-song-form-container').style.display = 'none';
        }
    });

    dialog.appendChild(button);
    document.body.appendChild(dialog);
}

