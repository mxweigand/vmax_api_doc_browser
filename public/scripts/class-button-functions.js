async function classButtonAddClick(jfqn) {
    const response = await fetch('/api/class/add?jfqn=' + encodeURIComponent(jfqn));
    swapClassButtons(jfqn);
}

async function classButtonRemoveClick(jfqn) {
    const response = await fetch('/api/class/remove?jfqn=' + encodeURIComponent(jfqn));
    swapClassButtons(jfqn);
}

function swapClassButtons(jfqn) {
    // using jquery, find all buttons and change their text
    $('button[data-jfqn="' + jfqn + '"]').each(function() {
        if ($(this).hasClass('class-button-add')) {
            $(this).replaceWith('<button class="class-button-remove" data-jfqn="' + jfqn + '" onclick="classButtonRemoveClick(\'' + jfqn + '\')">-</button>');
        }
        if ($(this).hasClass('class-button-remove')) {
            $(this).replaceWith('<button class="class-button-add" data-jfqn="' + jfqn + '" onclick="classButtonAddClick(\'' + jfqn + '\')">-</button>');
        }
    });
}

function classButtonInfoClick(jfqn) {
    openDialog({ 
        typeIsModal: false,
        isClassInfo: true,
        classJfqn: jfqn
    });
}