var comment = require('./comment.json');

module.exports = {

    activate: function() {
        atom.workspaceView.command('comment:toggle', this.toggle);
    },

    toggle: function() {
        var editor      = atom.workspace.activePaneItem,
            fileName    = editor.getTitle(),
            range       = editor.getSelectedBufferRange(),
            selection   = editor.getSelection(),
            cursor      = editor.getCursor(),
            text        = selection.getText(),
            ext         = getExtension(fileName);

        text = text || cursor.getCurrentBufferLine();

        if (!range.isEmpty() && (range.start.row < range.end.row)) {
            if (supportsMultiline(ext)) {
                editor.setTextInBufferRange(range, toggleComments(text, ext));
            } else {
                editor.setTextInBufferRange(range, toggleCommentsForUnsupportedMultiline(text, ext));
            }
        } else {
            toggleCommentsForSingleLine(text, ext, editor);
        }
    }

};


function toggleComments(text, ext) {

    var prefix = comment.prefix[ext],
        suffix = comment.suffix[ext],
        modifiedText;


    if (isCommented(text, ext)) {
        modifiedText = removeComment(text, ext);
    } else {
        modifiedText = addComment(text, ext);
    }

    return modifiedText;
}

function toggleCommentsForSingleLine(text, ext, editor) {
    var modifiedText = '',
        prefix = comment.singleLine[ext];

    if(!supportsSingleLine(ext)) {
        alert('Singleline comments for ' + ext + ' is not yet supported\nCheck back soon!');
        return;
    }

    if (isSingleLineCommented(text, prefix)) {
        editor.deleteLine();
        modifiedText = text.substr(prefix.length, text.length) + '\n';
        editor.insertText(modifiedText);
    } else {
        editor.moveCursorToBeginningOfLine();
        modifiedText = prefix;
        editor.insertText(modifiedText);
        editor.moveCursorDown();
    }

    return modifiedText;
}


function toggleCommentsForUnsupportedMultiline(text, ext) {

    var modifiedText = '',
        prefix = comment.prefix[ext],
        lines = text.split('\n');

    lines.pop();
    lines.forEach(function(line) {
        if (isSingleLineCommented(line, prefix)) {
            modifiedText += line.substr(1, line.length) + '\n';
        } else {
            modifiedText += '#' + line + '\n';
        }

    });

    return modifiedText;
}


function addComment(text, ext) {
    var prefix = comment.prefix[ext],
        suffix = comment.suffix[ext];

    return prefix + text + suffix;
}


function removeComment(text, ext) {
    var prefix = comment.prefix[ext],
        suffix = comment.suffix[ext],
        strippedText;

    strippedText = text.substr(prefix.length, text.length);
    strippedText = strippedText.substr(0, strippedText.length - suffix.length);

    return strippedText;
}


function isCommented(text, ext) {
    var prefixLength = comment.prefix[ext].length,
        suffixLength = comment.suffix[ext].length,
        commentStartMatch, commentEndMatch;

    commentStartMatch = (text.substr(0, prefixLength) === comment.prefix[ext]);
    commentEndMatch = (text.substr(text.length - suffixLength, text.length) === comment.suffix[ext]);

    return commentStartMatch && commentEndMatch;
}


function isSingleLineCommented(text, prefix) {
    return text.substr(0, prefix.length) === prefix;
}


function getExtension(fileName) {
    var components = fileName.split('.');
    return components[components.length-1];
}


function supportsMultiline(ext) {
    return comment.suffix[ext].length > 0;
}

function supportsSingleLine(ext) {
    return comment.singleLine[ext].length > 0;
}
