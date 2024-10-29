function dialogCloseButtonClick() {
    document.querySelector("dialog#info").close();
}

function dialogOkButtonClick(action) {
    if (action === 'CLEAR') {
        fetch('/api/tools/clear')
        .then(location.reload());
    } else if (action === 'GENERATE') {
        // fetch and download response as file
        fetch('/api/tools/generate')
            .then(response => response.blob())
            .then(blob => {
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = "Interface.java";
                document.body.appendChild(a);
                a.click();    
                a.remove();     
                document.querySelector("dialog#info").close();    
            });
    }  else if (action === 'SAVE') {
        fetch('/api/tools/save')
        .then(document.querySelector("dialog#info").close())
    } else {
        throw new Error('Unknown action');
    }
}

async function openDialog(info) {
    if (document.querySelector("dialog#info").open) {
        document.querySelector("dialog#info").close();
    }
    const infoDialog = document.querySelector("dialog#info");
    if (info.typeIsModal === true) {
        const infoAsHtml = getToolInfoAsHtml(info);
        $(infoDialog).find("div#info-content").first().replaceWith(infoAsHtml);
        infoDialog.showModal();
    } else {
        const infoAsHtml = await getClassInfoAsHtml(info);
        $(infoDialog).find("div#info-content").first().replaceWith(infoAsHtml);
        infoDialog.show();
    }
}

function getToolInfoAsHtml(info) {
    const toolInfoAsHtml = $(`
        <div id="info-content">
            <h1>${info.title}</h1>
            <p>${info.message}</p>
            <button id="message-ok" onclick="dialogOkButtonClick('${info.action}')">${info.okButtonText}</button>
            <button id="message-cancel" onclick="dialogCloseButtonClick()">CANCEL</button>
        </div>
    `);
    return toolInfoAsHtml;
}

async function getClassInfoAsHtml(info) {
    // request info from backend
    var response;
    if (info.isClassInfo) {
        response = await fetch('/api/class/info?jfqn=' + encodeURIComponent(info.classJfqn))
    } else {
        response = await fetch(
            '/api/method/info?classJfqn=' + encodeURIComponent(info.classJfqn)
            + '&methodName=' + encodeURIComponent(info.methodName))
    }
    const responseJson = await response.json();
    // create HTML

    var classInfoAsHtml = $('<div id="info-content"></div>');
    classInfoAsHtml.append(`<h1>Class/Interface ${getClassWithLinkHtml(responseJson.class.name, responseJson.class.package)}</h1>`);
    if (responseJson.added === 'not-added') {
        classInfoAsHtml.append('<p>Status: not added yet</p>')
        return classInfoAsHtml;
    } else if (responseJson.added === 'added') {
        classInfoAsHtml.append('<p>Status: added</p>')
    } else {
        throw new Error('Unknown status');
    }
    classInfoAsHtml.append('<h2>Added Superclasses</h2>');
    if (responseJson.addedSuperclasses.length === 0) {
        classInfoAsHtml.append('<p>No superclasses added yet</p>');
    }
    for (const superclass of responseJson.addedSuperclasses) {
        classInfoAsHtml.append(`<p>${getClassWithLinkHtml(superclass.name, superclass.package)}</p>`);
    }
    classInfoAsHtml.append('<h2>Added Subclasses</h2>');
    if (responseJson.addedSubclasses.length === 0) {
        classInfoAsHtml.append('<p>No subclasses added yet</p>');
    }
    for (const subclass of responseJson.addedSubclasses) {
        classInfoAsHtml.append(`<p>${getClassWithLinkHtml(subclass.name, subclass.package)}</p>`);
    }
    classInfoAsHtml.append('<h2>Added Methods</h2>');
    if (responseJson.addedMethods.length === 0) {
        classInfoAsHtml.append('<p>No methods added yet</p>');
    }
    for (const method of responseJson.addedMethods) {
        var methodInfo = $(`<p>${getMethodWithLinkHtml(responseJson.class.name, responseJson.class.package, method.name, method.returnType.name, method.multiplicity)}</p>`);
        if (method.highlight) {
            // insert red symbol before
            methodInfo.prepend('<span style="color: red;">&#x279C;</span> ');
        }
        classInfoAsHtml.append(methodInfo);
    }
    return classInfoAsHtml;

}

function getClassWithLinkHtml(className, packageName) {
    const packageAsArray = packageName.split('.');
    const packageLink = '/javadoc/' + packageAsArray.join('/') + '/package-summary.html';
    const classLink = '/javadoc/' + packageAsArray.join('/') + '/' + className + '.html';
    return `<a href="${classLink}">${className}</a> <a href="${packageLink}">(Package ${packageName})</a>`;
}

function getMethodWithLinkHtml(className, packageName, methodName, returnType, multiplicity) {
    const packageAsArray = packageName.split('.');
    const methodLink = '/javadoc/' + packageAsArray.join('/') + '/' + className + '.html#' + methodName + '()';
    if (multiplicity === 'SET') {
        return `<a href="${methodLink}">Set&lt;${returnType}&gt; ${methodName}()</a>`;
    } else if (multiplicity === 'LIST') {
        return `<a href="${methodLink}">List&lt;${returnType}&gt; ${methodName}()</a>`;
    } else if (multiplicity === 'COLLECTION') {
        return `<a href="${methodLink}">Collection&lt;${returnType}&gt; ${methodName}()</a>`;
    } else if (multiplicity === 'SINGLE') {
        return `<a href="${methodLink}">${returnType} ${methodName}()</a>`;
    } else {
        throw new Error('Unknown multiplicity');
    }
}