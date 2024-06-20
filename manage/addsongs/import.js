document.addEventListener('DOMContentLoaded', function () {
    const importButton = document.getElementById('import-button');
    const cancelButton = document.getElementById('cancel-button');
    const browseButton = document.getElementById('browse-button');
    const fileUploadInput = document.getElementById('file-upload');
    const overlay = document.getElementById('overlay');
    const importBox = document.getElementById('import-box');
    const importFileButton = document.getElementById('import-file-button');

    if (importButton) {
        importButton.addEventListener('click', function () {
            if (overlay) overlay.style.display = 'block';
            if (importBox) importBox.style.display = 'block';
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', function () {
            if (overlay) overlay.style.display = 'none';
            if (importBox) importBox.style.display = 'none';
        });
    }

    if (browseButton) {
        browseButton.addEventListener('click', function () {
            if (fileUploadInput) fileUploadInput.click();
        });
    }

    if (fileUploadInput) {
        fileUploadInput.addEventListener('change', function () {
            const fileName = this.files[0] ? this.files[0].name : '';
            if (browseButton) browseButton.innerText = fileName ? fileName : 'Browse';
        });
    }

    if (importFileButton) {
        importFileButton.addEventListener('click', function () {
            // Add your import file logic here
        });
    }
});
