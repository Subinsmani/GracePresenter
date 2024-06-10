document.addEventListener('DOMContentLoaded', function () {
    fetchCategories();

    document.getElementById('add-new-songs').addEventListener('click', function (event) {
        event.preventDefault();
        showAddSongFormContainer();
    });

    document.getElementById('add-song-form').addEventListener('submit', function (event) {
        event.preventDefault();

        if (!validateForm()) {
            showDialog('Please fill in all required fields.', 'OK', 'red');
            return;
        }

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

        generateNewId(category)
            .then(newId => {
                const songData = {
                    id: newId,
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
            })
            .catch(error => {
                showDialog(`Error generating new ID: ${error.message}`, 'Go Back', 'red');
            });
    });

    document.getElementById('category').addEventListener('change', function () {
        showAdditionalFields();
    });

    document.getElementById('has-translation').addEventListener('change', function () {
        toggleTranslationFields();
    });

    document.querySelector('.add-lyrics').addEventListener('click', function () {
        addLyricsBoxes();
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
    hideAdditionalFields();
}

function showAddSongFormContainer() {
    document.getElementById('add-song-form-container').style.display = 'block';
}

function showAdditionalFields() {
    document.getElementById('import-button').style.display = 'inline-block';
    document.querySelector('.song-name-container').style.display = 'flex';
    document.querySelector('.lyrics-container1').style.display = 'block';
    document.getElementById('submit-song').style.display = 'block';
    document.getElementById('has-translation-group').style.display = 'block';
}

function hideAdditionalFields() {
    document.getElementById('import-button').style.display = 'none';
    document.querySelector('.song-name-container').style.display = 'none';
    document.querySelector('.lyrics-container1').style.display = 'none';
    document.querySelector('.lyrics-container2').style.display = 'none';
    document.getElementById('submit-song').style.display = 'none';
    document.getElementById('has-translation-group').style.display = 'none';
}

function toggleTranslationFields() {
    const hasTranslation = document.getElementById('has-translation').value;
    const lyricsContainer2 = document.querySelector('.lyrics-container2');
    if (hasTranslation === 'yes') {
        lyricsContainer2.style.display = 'block';
    } else {
        lyricsContainer2.style.display = 'none';
    }
}

function generateNewId(category) {
    return new Promise((resolve, reject) => {
        let prefix = '';

        switch (category.toLowerCase()) {
            case 'english':
                prefix = '10';
                break;
            case 'hindi':
                prefix = '20';
                break;
            case 'malayalam':
                prefix = '30';
                break;
            default:
                return reject(new Error('Invalid category'));
        }

        fetch(`/manage/get-max-id?category=${category}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch max ID');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    const currentMaxId = data.maxId ? parseInt(String(data.maxId).slice(2)) : 0;
                    const newId = `${prefix}${String(currentMaxId + 1).padStart(4, '0')}`;
                    resolve(newId);
                } else {
                    reject(new Error('Failed to fetch max ID'));
                }
            })
            .catch(error => {
                reject(error);
            });
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
        if (buttonColor === 'green') {
            document.getElementById('add-song-form-container').style.display = 'none';
        }
    });

    dialog.appendChild(button);
    document.body.appendChild(dialog);
}

function validateForm() {
    const songName = document.getElementById('song-name');
    const lyrics1Title = document.getElementById('lyrics1-title');
    const category = document.getElementById('category');

    if (!songName.value || !lyrics1Title.value || !category.value) {
        return false;
    }
    return true;
}

function addLyricsBoxes() {
    addLyricsBox('.lyrics1-container', 'lyrics1', true);
    addLyricsBox('.lyrics2-container', 'lyrics2', false);
}

function addLyricsBox(containerSelector, textareaClass, addRemoveButton) {
    const container = document.querySelector(containerSelector);
    const lyricsBox = document.createElement('div');
    lyricsBox.className = 'lyrics-box';
    lyricsBox.style.position = 'relative';
    
    const newTextArea = document.createElement('textarea');
    newTextArea.rows = 4;
    newTextArea.className = textareaClass;
    newTextArea.name = textareaClass;
    newTextArea.style.minHeight = '100px';
    
    lyricsBox.appendChild(newTextArea);

    if (addRemoveButton) {
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.textContent = '-';
        removeButton.className = 'remove-lyrics';

        removeButton.addEventListener('click', function () {
            container.removeChild(lyricsBox);
            if (textareaClass === 'lyrics1') {
                const correspondingLyrics2Box = document.querySelector('.lyrics2-container .lyrics-box');
                if (correspondingLyrics2Box) {
                    correspondingLyrics2Box.remove();
                }
            }
        });

        lyricsBox.appendChild(removeButton);
    }

    container.appendChild(lyricsBox);
}
