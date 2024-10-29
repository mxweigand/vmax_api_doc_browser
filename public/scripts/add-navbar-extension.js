$(document).ready(function() {
    $('div#navbar-top').first().append(`
        <div id="navbar-extension">
            <button class="last-button" onclick="openDialog({ 
                typeIsModal: true,
                title: 'Save Data',
                message: 'Do you want save the current state? All added API components will be added to the database and will be available upon restarting the application.',
                okButtonText: 'YES',
                action: 'SAVE'
            })">SAVE</button>
            <button class="middle-button" onclick="openDialog({ 
                typeIsModal: true,
                title: 'Clear Data',
                message: 'Do you want to clear all added data?',
                okButtonText: 'YES',
                action: 'CLEAR'
            })">CLEAR</button>
            <button class="middle-button" onclick="openDialog({ 
                typeIsModal: true,
                title: 'Generate Code',
                message: 'Do you want to generate the code for interface? The code will be created based on the currently added API components. It will be dowloaded afterwards as a .java file',
                okButtonText: 'YES',
                action: 'GENERATE'
            })">GENERATE</button>
            <button class="first-button" disabled>&#9881;</button>
        </div>
    `);
});
