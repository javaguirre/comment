var comment = require('./comment.json');

module.exports = {
    toggleHtmlSingleLineOrEmptySelection: function(ext, editor) {

        var range, text, selection;

        // Make selection
        editor.moveToEndOfLine();
        editor.selectToBeginningOfLine();

        range = editor.getSelectedBufferRange();
        selection = editor.getLastSelection();
        text = selection.getText();

        editor.setTextInBufferRange(range, toggleComments(text, ext, 'singleline'));
        editor.moveDown();
        editor.moveToBeginningOfLine();
    },


    toggleComments: function(text, ext, type) {

        var prefix = comment[type].prefix[ext],
            suffix = comment[type].suffix[ext],
            modifiedText;


        if (isCommented(text, ext, type)) {
            modifiedText = removeComment(text, ext, type);
        } else {
            modifiedText = addComment(text, ext, type);
        }

        return modifiedText;
    },

    toggleCommentsForSingleLine: function(text, ext, editor) {
        var modifiedText = '',
            prefix = comment.singleline.prefix[ext];

        if (this.isSingleLineCommented(text, prefix)) {
            editor.deleteLine();
            modifiedText = text.substr(prefix.length, text.length) + '\n';
            editor.insertText(modifiedText);
        } else {
            editor.moveToBeginningOfLine();
            modifiedText = prefix;
            editor.insertText(modifiedText);
            editor.moveDown();
        }

        return modifiedText;
    },

    toggleCommentsForUnsupportedMultiline: function(text, ext) {

        var modifiedText = '',
            prefix = comment.singleline.prefix[ext],
            lines = text.split('\n');

        lines.pop();
        lines.forEach(function(line) {
            if (this.isSingleLineCommented(line, prefix)) {
                modifiedText += line.substr(1, line.length) + '\n';
            } else {
                modifiedText += '#' + line + '\n';
            }

        });

        return modifiedText;
    },


    addComment: function(text, ext, type) {
        var prefix = comment[type].prefix[ext],
            suffix = comment[type].suffix[ext];

        return prefix + text + suffix;
    },


    removeComment: function(text, ext, type) {
        var prefix = comment[type].prefix[ext],
            suffix = comment[type].suffix[ext],
            strippedText;

        strippedText = text.substr(prefix.length, text.length);
        strippedText = strippedText.substr(0, strippedText.length - suffix.length);

        return strippedText;
    },


    isCommented: function(text, ext, type) {
        var prefixLength = comment[type].prefix[ext].length,
            suffixLength = comment[type].suffix[ext].length,
            commentStartMatch, commentEndMatch;

        commentStartMatch = (text.substr(0, prefixLength) === comment[type].prefix[ext]);
        commentEndMatch = (text.substr(text.length - suffixLength, text.length) === comment[type].suffix[ext]);

        return commentStartMatch && commentEndMatch;
    },


    isSingleLineCommented: function(text, prefix) {
        return text.substr(0, prefix.length) === prefix;
    },

    getExtension: function(fileName) {
        var components = fileName.split('.');
        return components[components.length-1];
    },

    supportsMultiline: function(ext) {
        return comment.multiline.suffix[ext].length > 0;
    },

    isUnsupportedSingleLine: function(ext) {
        return (ext.indexOf('htm') > -1) || ext === 'md' || ext === 'css';
    }
};
