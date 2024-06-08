document.getElementById('import-button').addEventListener('click', function () {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('import-box').style.display = 'block';
});

document.getElementById('cancel-button').addEventListener('click', function () {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('import-box').style.display = 'none';
});

document.getElementById('browse-button').addEventListener('click', function () {
    document.getElementById('file-upload').click();
});

document.getElementById('file-upload').addEventListener('change', function () {
    const fileName = this.files[0] ? this.files[0].name : '';
    document.getElementById('browse-button').innerText = fileName ? fileName : 'Browse';
});
