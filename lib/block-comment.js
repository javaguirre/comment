var comment = require('./comment.json');

module.exports = {

    activate: function() {
        atom.workspaceView.command('block-comment:toggle', this.toggle);
    },

    toggle: function() {
        var editor      = atom.workspace.activePaneItem,
            fileName    = editor.getTitle(),
            range       = editor.getSelectedBufferRange(),
            selection   = editor.getSelection(),
            text        = selection.getText(),
            ext         = getExtension(fileName);

        prefix = comment.prefix[ext];
        suffix = comment.suffix[ext];

        if (!range.isEmpty()) {
            if (supportsMultiline(ext)) {
                editor.setTextInBufferRange(range, toggleComments(text, ext));
            } else {
                editor.setTextInBufferRange(range, toggleCommentsForUnsupportedMultiline(text, ext));
            }

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

function toggleCommentsForUnsupportedMultiline(text, ext) {

    var modifiedText = '';

    text.split('\n').forEach(function(line) {
        //console.log(line);
        modifiedText += '# ' + line + '\n';
    });
    console.log(modifiedText);
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

function getExtension(fileName) {
    var components = fileName.split('.');
    return components[components.length-1];
}


function supportsMultiline(ext) {
    return comment.suffix[ext].length > 0;
}
