// get all links and add buttons after them if they link to a class or interface
$(document).ready(function() {
    $('a').not( ".external-link" ).each(async function () {
        if ( /^class in /.test($(this).attr('title')) || /^interface in /.test($(this).attr('title')) ) {     
            const jfqn = relativePathToJfqn($(this).attr('href'));
            const classStatus = await getClassStatus(jfqn);
            if (!classStatus) {
                $(this).after('<button class="class-button-warning" disabled>!</button>');
                $(this).after('<button class="class-button-info" disabled">C</button>');
            } else {
                if (classStatus === 'added') {
                    $(this).after('<button class="class-button-remove" data-jfqn="' + jfqn + '" onclick="classButtonRemoveClick(\'' + jfqn + '\')">-</button>');
                    $(this).after('<button class="class-button-info" data-jfqn="' + jfqn + '" onclick="classButtonInfoClick(\'' + jfqn + '\')">C</button>');
                } else if (classStatus === 'not-added') {
                    $(this).after('<button class="class-button-add" data-jfqn="' + jfqn + '" onclick="classButtonAddClick(\'' + jfqn + '\')">+</button>');
                    $(this).after('<button class="class-button-info" data-jfqn="' + jfqn + '" onclick="classButtonInfoClick(\'' + jfqn + '\')">C</button>');
                } else {
                    $(this).after('<button class="class-button-warning">!</button>');
                    $(this).after('<button class="class-button-info" disabled">C</button>');
                }
            }
    }});
    $("h1.title").each(async function () {
        if ( /^Interface /.test($(this).text()) || /^Class /.test($(this).text()) ) { 
            const jfqn = relativePathToJfqn(window.location.pathname.split("/").pop());
            const classStatus = await getClassStatus(jfqn);
            if (!classStatus) {
                $(this).append('<button class="class-button-info" disabled">C</button>');
                $(this).append('<button class="class-button-warning" disabled>!</button>');
            } else {
                if (classStatus === 'added') {
                    $(this).append('<button class="class-button-info" data-jfqn="' + jfqn + '" onclick="classButtonInfoClick(\'' + jfqn + '\')">C</button>');
                    $(this).append('<button class="class-button-remove" data-jfqn="' + jfqn + '" onclick="classButtonRemoveClick(\'' + jfqn + '\')">-</button>');
                } else if (classStatus === 'not-added') {
                    $(this).append('<button class="class-button-info" data-jfqn="' + jfqn + '" onclick="classButtonInfoClick(\'' + jfqn + '\')">C</button>');
                    $(this).append('<button class="class-button-add" data-jfqn="' + jfqn + '" onclick="classButtonAddClick(\'' + jfqn + '\')">+</button>');
                } else {
                    $(this).append('<button class="class-button-info" disabled">C</button>');
                    $(this).append('<button class="class-button-warning">!</button>');
                }
            }
    }});
});

// converts a relative path to a html file into a java fully qualified name (jfqn)
function relativePathToJfqn(relativePath) {
    // cut off first 3 elements of relativePath ['', 'localhost:3000', 'javadoc'] and last one ('xyz.html')
    let currentLocationAsArray = window.location.href.split('/');
    currentLocationAsArray = currentLocationAsArray.slice(4, currentLocationAsArray.length - 1);
    // count number of '..' in array htmlPathAsArray
    let relativePathAsArray = relativePath.split('/');
    let count = 0;
    while (relativePathAsArray[count] === '..') { count++; }
    // delete '.html' from last element
    relativePathAsArray[relativePathAsArray.length - 1] = relativePathAsArray[relativePathAsArray.length - 1].replace('.html', '');
    // cut off elements of both arrays according to count
    const prefix = currentLocationAsArray.slice(0, currentLocationAsArray.length - count);
    const suffix = relativePathAsArray.slice(count, relativePathAsArray.length);
    // return array joined with '.'
    return prefix.join('.') + '.' + suffix.join('.');
}

async function getClassStatus(jfqn) {
    const response = await (await fetch('/api/class/status?jfqn=' + encodeURIComponent(jfqn))).text();
    return response;   
}

