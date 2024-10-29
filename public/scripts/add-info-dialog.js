$(document).ready(function() {
    $('body').append(`
        <dialog id="info">
            <button autofocus id="close" onclick="dialogCloseButtonClick()">&#10005;</button>
            <div id="info-content">
            </div>
        </dialog>
    `);
});

