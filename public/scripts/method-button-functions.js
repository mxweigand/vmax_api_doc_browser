async function methodButtonAddClick(classJfqn, methodName, returnTypeJfqn, multiplicity) {
    const response = await fetch(
        '/api/method/add?classJfqn=' + encodeURIComponent(classJfqn)
        + '&methodName=' + encodeURIComponent(methodName)
        + '&returnTypeJfqn=' + encodeURIComponent(returnTypeJfqn)
        + '&multiplicity=' + encodeURIComponent(multiplicity));
    const responseClassesAutomaticallyAdded = await response.json();
    swapMethodButtons(classJfqn, methodName, returnTypeJfqn, multiplicity);
    // also swap class buttons if classes were added automatically
    if (responseClassesAutomaticallyAdded.sourceClassAutomaticallyAdded === true) {
       swapClassButtons(classJfqn);
    }
    if (responseClassesAutomaticallyAdded.returnTypeClassAutomaticallyAdded === true && returnTypeJfqn !== classJfqn) {
        swapClassButtons(returnTypeJfqn);
    }
}

async function methodButtonRemoveClick(classJfqn, methodName, returnTypeJfqn, multiplicity) {
    const response = await fetch(
        '/api/method/remove?classJfqn=' + encodeURIComponent(classJfqn)
        + '&methodName=' + encodeURIComponent(methodName));
    swapMethodButtons(classJfqn, methodName, returnTypeJfqn, multiplicity);
}

function swapMethodButtons(classJfqn, methodName, returnTypeJfqn, multiplicity) {
    // using jquery, find all buttons and change their text
    $('button[data-class-jfqn="' + classJfqn + '"][data-method-name="' + methodName + '"]').each(function() {
        if ($(this).hasClass('method-button-add')) {
            $(this).replaceWith(
                '<button class="method-button-remove" data-class-jfqn="' 
                + classJfqn 
                + '" data-method-name="' 
                + methodName 
                + '" onclick="methodButtonRemoveClick(\'' 
                + classJfqn 
                + '\', \'' 
                + methodName 
                + '\', \'' 
                + returnTypeJfqn 
                + '\', \'' 
                + multiplicity 
                + '\')">+</button>'
            );
        }
        if ($(this).hasClass('method-button-remove')) {
            $(this).replaceWith(
                '<button class="method-button-add" data-class-jfqn="' 
                + classJfqn 
                + '" data-method-name="' 
                + methodName 
                + '" onclick="methodButtonAddClick(\'' 
                + classJfqn 
                + '\', \'' 
                + methodName 
                + '\', \'' 
                + returnTypeJfqn 
                + '\', \'' 
                + multiplicity 
                + '\')">+</button>'
            );
        }
    });
}

function methodButtonInfoClick(classJfqn, methodName, returnTypeJfqn, multiplicity) {
    openDialog({ 
        typeIsModal: false,
        isClassInfo: false,
        classJfqn: classJfqn,
        methodName: methodName,
        returnTypeJfqn: returnTypeJfqn, 
        multiplicity: multiplicity
    });
}