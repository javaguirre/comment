var comment = require('./comment.json'),
    sprint = require('sprint').sprint;

module.exports = {

    activate: function() {

        atom.workspaceView.command('comment:toggle', this.toggle);
        atom.workspaceView.command('comment:toggleSingleLine', this.toggleSingleLine);
    },

    toggleSingleLine: function() {
        console.log('Single line');
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

        // If more than one line is selected
        if (!range.isEmpty() && (range.start.row < range.end.row)) {

            // If file type supports multiline comments
            if (supportsMultiline(ext)) {
                editor.setTextInBufferRange(range, toggleComments(text, ext, 'multiline'));

            // If file type does not support multiline comments
            } else {
                editor.setTextInBufferRange(range, toggleCommentsForUnsupportedMultiline(text, ext));
            }

        // If file html style comments AND selection is empty OR only one line is selected
        // Enclose that line in html-style comments
    } else if (isUnsupportedSingleLine(ext) && (range.isEmpty() || range.start.row === range.end.row)) {
            toggleHtmlSingleLineOrEmptySelection(ext, editor);

        // Range is empty. Comment single line
        } else {
            toggleCommentsForSingleLine(text, ext, editor, range);
        }
    }

};


function toggleHtmlSingleLineOrEmptySelection(ext, editor) {

    var range, text, selection;

    // Make selection
    editor.moveCursorToEndOfLine();
    editor.selectToBeginningOfLine();

    range = editor.getSelectedBufferRange();
    selection = editor.getSelection();
    text = selection.getText();

    editor.setTextInBufferRange(range, toggleComments(text, ext, 'singleline'));
    editor.moveCursorDown();
    editor.moveCursorToBeginningOfLine();
}


function toggleComments(text, ext, type) {

    var prefix = comment[type].prefix[ext],
        suffix = comment[type].suffix[ext],
        modifiedText;


    if (isCommented(text, ext, type)) {
        modifiedText = removeComment(text, ext, type);
    } else {
        modifiedText = addComment(text, ext, type);
    }

    return modifiedText;
}

function toggleCommentsForSingleLine(text, ext, editor) {
    var modifiedText = '',
        prefix = comment.singleline.prefix[ext];

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
        prefix = comment.singleline.prefix[ext],
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


function addComment(text, ext, type) {
    var prefix = comment[type].prefix[ext],
        suffix = comment[type].suffix[ext];

    return prefix + text + suffix;
}


function removeComment(text, ext, type) {
    var prefix = comment[type].prefix[ext],
        suffix = comment[type].suffix[ext],
        strippedText;

    strippedText = text.substr(prefix.length, text.length);
    strippedText = strippedText.substr(0, strippedText.length - suffix.length);

    return strippedText;
}


function isCommented(text, ext, type) {
    var prefixLength = comment[type].prefix[ext].length,
        suffixLength = comment[type].suffix[ext].length,
        commentStartMatch, commentEndMatch;

    commentStartMatch = (text.substr(0, prefixLength) === comment[type].prefix[ext]);
    commentEndMatch = (text.substr(text.length - suffixLength, text.length) === comment[type].suffix[ext]);

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
    return comment.multiline.suffix[ext].length > 0;
}

function isUnsupportedSingleLine(ext) {
    return (ext.indexOf('htm') > -1) || ext === 'md' || ext === 'css';
}
