// get all links in 'Method Summary' section and add buttons after them (if they qualify)
$(document).ready(function() {
    $('section.method-summary div.summary-table div.col-second code').each(async function () {
        // only those methods that have '()' at the end of their name are considered
        if (/.*\(\)$/.test($(this).text())) {
            // get first row div > code i.e. the previous column element
            const returnTypeElement = $(this).parent().prev('div.col-first').children('code').first();
            // multiplicity
            let multiplicity = '';
            let returnTypeJfqn = '';
            if (/^List<[\w\.]+>$/.test(returnTypeElement.text())) {
                multiplicity = 'LIST';
                returnTypeJfqn = getJfqnFromGeneric(returnTypeElement);
            } else if (/^Set<[\w\.]+>$/.test(returnTypeElement.text())) {
                multiplicity = 'SET';
                returnTypeJfqn = getJfqnFromGeneric(returnTypeElement);
            } else if (/^Collection<[\w\.]+>$/.test(returnTypeElement.text())) {
                multiplicity = 'COLLECTION';
                returnTypeJfqn = getJfqnFromGeneric(returnTypeElement);
            } else if (false) {
                multiplicity = 'ARRAY';
            } else { 
                multiplicity = 'SINGLE';
                returnTypeJfqn = getJfqnFromElement(returnTypeElement.contents().first());
            }
            // if multiplicity or returnTypeJfqn is empty, skip this
            if (multiplicity === '' || returnTypeJfqn === '') {
                return;
            }
            // get method name from href and cut off first character '#' and last 2 characters '()' of methodName
            let methodName = $(this).find('a').first().attr('href')
            methodName = methodName.slice(1, methodName.length - 2);
            // add buttons
            addMethodButtons($(this), methodName, returnTypeJfqn, multiplicity);
        }
    });
    // get all links in 'Method Details' section and add buttons after them (if they qualify)
    $('section.method-details ul.member-list li section.detail div.member-signature').each(async function () {
        // only those which do not have a span.parameters child 
        if ($(this).find('span.parameters').length === 0) {
           // get first row div > code i.e. the previous column element
           const returnTypeElement = $(this).children('span.return-type').first();
           // multiplicity
           let multiplicity = '';
           let returnTypeJfqn = '';
           if (/^List<[\w\.]+>$/.test(returnTypeElement.text())) {
               multiplicity = 'LIST';
               returnTypeJfqn = getJfqnFromGeneric(returnTypeElement);
           } else if (/^Set<[\w\.]+>$/.test(returnTypeElement.text())) {
               multiplicity = 'SET';
               returnTypeJfqn = getJfqnFromGeneric(returnTypeElement);
           } else if (/^Collection<[\w\.]+>$/.test(returnTypeElement.text())) {
               multiplicity = 'COLLECTION';
               returnTypeJfqn = getJfqnFromGeneric(returnTypeElement);
           } else if (false) {
               multiplicity = 'ARRAY';
           } else { 
               multiplicity = 'SINGLE';
               returnTypeJfqn = getJfqnFromElement(returnTypeElement.contents().first());
           }
           // if multiplicity or returnTypeJfqn is empty, skip this
           if (multiplicity === '' || returnTypeJfqn === '') {
               return;
           }
           // get method name from href and cut off first character '#' and last 2 characters '()' of methodName
           let methodName = $(this).children('span.element-name').first().text();
           // add buttons
           addToElement = $(this).parent('section.detail').find('h3').first();
           addMethodButtons(addToElement, methodName, returnTypeJfqn, multiplicity);
        }
    });
});

// function to get jfqn from LIST or SET or COLLECTION
function getJfqnFromGeneric(returnTypeElement) {
    // get element inside < ... >
    innerElement = returnTypeElement.contents().filter(function() { 
        return this.nodeType === Node.TEXT_NODE && this.nodeValue == '<';
    }).first().next();
    return getJfqnFromElement(innerElement);
}

// function to get jfqn from text or link
function getJfqnFromElement(element) {
    // if link
    if (element.prop('tagName') === 'A') {
        // links to java.lang
        if (element.hasClass('external-link')) {
            // if string
            if (element.text() === 'String') {
                return 'java.lang.String';
            // if Boolean
            } else if (element.text() === 'Boolean') {
                return 'java.lang.Boolean';
            }
            // if Integer
            else if (element.text() === 'Integer') {
                return 'java.lang.Integer';
            }
            // if Double
            else if (element.text() === 'Double') {
                return 'java.lang.Double';
            } else {
                return '';
            }
        // if internal link
        } else {
            // use method from class-button-functions.js
            return relativePathToJfqn(element.attr('href'));
        }
    // if no link, try to get text
    } else {
        if (element.text() === 'boolean') {
            return 'boolean';
        } else if (element.text() === 'int') {
            return 'int';
        } else if (element.text() === 'double') {
            return 'double';
        } else {
            return '';
        }
    }
}

// function to add buttons after a method name
async function addMethodButtons(element, methodName, returnTypeJfqn, multiplicity) {
    // get current class jfqn: cut off first 3 elements of relativePath ['', 'localhost:3000', 'javadoc'], then cut off .html from last element
    let currentLocationAsArray = window.location.href.split('/');
    currentLocationAsArray = currentLocationAsArray.slice(4, currentLocationAsArray.length);
    currentLocationAsArray[currentLocationAsArray.length - 1] = currentLocationAsArray[currentLocationAsArray.length - 1].replace('.html', '');
    const currentClassJfqn = currentLocationAsArray.join('.');
    // get method status
    const methodStatus = await getMethodStatus(currentClassJfqn, methodName);
    // add buttons
    if (!methodStatus) {
        element.append('<button class="method-button-info" disabled">M</button>');
        element.append('<button class="method-button-warning" disabled>!</button>');
    } else {
        if (methodStatus === 'added') {
            element.append(
                '<button class="method-button-info" data-class-jfqn="' 
                + currentClassJfqn 
                + '" data-method-name="' 
                + methodName 
                + '" onclick="methodButtonInfoClick(\'' 
                + currentClassJfqn 
                + '\', \'' 
                + methodName 
                + '\', \'' 
                + returnTypeJfqn 
                + '\', \'' 
                + multiplicity 
                + '\')">M</button>');
            element.append(
                '<button class="method-button-remove" data-class-jfqn="' 
                + currentClassJfqn 
                + '" data-method-name="' 
                + methodName 
                + '" onclick="methodButtonRemoveClick(\'' 
                + currentClassJfqn 
                + '\', \'' 
                + methodName 
                + '\', \'' 
                + returnTypeJfqn 
                + '\', \'' 
                + multiplicity 
                + '\')">+</button>');
        } else if (methodStatus === 'not-added') {
            element.append(
                '<button class="method-button-info" data-class-jfqn="' 
                + currentClassJfqn 
                + '" data-method-name="' 
                + methodName 
                + '" onclick="methodButtonInfoClick(\'' 
                + currentClassJfqn 
                + '\', \'' 
                + methodName 
                + '\', \'' 
                + returnTypeJfqn 
                + '\', \'' 
                + multiplicity 
                + '\')">M</button>');
            element.append(
                '<button class="method-button-add" data-class-jfqn="' 
                + currentClassJfqn 
                + '" data-method-name="' 
                + methodName 
                + '" onclick="methodButtonAddClick(\'' 
                + currentClassJfqn 
                + '\', \'' 
                + methodName 
                + '\', \'' 
                + returnTypeJfqn 
                + '\', \'' 
                + multiplicity 
                + '\')">+</button>');
        } else {
            element.append('<button class="method-button-info" disabled">M</button>');
            element.append('<button class="method-button-warning" disabled>!</button>');
        }
    }
}

async function getMethodStatus(classJfqn, methodName) {
    const response = await (await fetch(
        '/api/method/status?classJfqn=' + encodeURIComponent(classJfqn)
        + '&methodName=' + encodeURIComponent(methodName))).text()
    return response;   
}
