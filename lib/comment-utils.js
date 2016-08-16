var comment = require('./comment.json');

module.exports = {
    UNSUPPORTED_SINGLE_LINE_EXTENSIONS: ['htm', 'html', 'md', 'css'],
    DEFAULT_PREFIX: '#',
    DEFAULT_SUFFIX: '\n',

    toggle: function(range, text, ext, editor) {
        this.COMMENT_SUFFIX = atom.config.get('comment.commentSuffix');

        if (this.isMultilineSelected(range)) {
            this.toggleMultilineCommentsWithRange(editor, range, text, ext);
        } else {
            this.toggleSingleCommentsWithRange(editor, range, text, ext);
        }
    },

    toggleMultilineCommentsWithRange: function(editor, range, text, ext) {
        if (this.supportsMultiline(ext)) {
            editor.setTextInBufferRange(
                range,
                this.toggleComments(text, ext, 'multiline')
            );
        } else {
            editor.setTextInBufferRange(
                range,
                this.toggleCommentsForUnsupportedMultiline(text, ext)
            );
        }
    },

    toggleSingleCommentsWithRange: function(editor, range, text, ext) {
        if (this.isUnsupportedSingleLine(ext) &&
            (range.isEmpty() ||
             range.start.row === range.end.row)
        ) {
            this.toggleHtmlSingleLineOrEmptySelection(ext, editor);

            // Range is empty. Comment single line
        } else {
            this.toggleCommentsForSingleLine(text, ext, editor, range);
        }
    },

    toggleHtmlSingleLineOrEmptySelection: function(ext, editor) {
        var range, text, selection;

        // Make selection
        editor.moveToEndOfLine();
        editor.selectToBeginningOfLine();

        range = editor.getSelectedBufferRange();
        selection = editor.getLastSelection();
        text = selection.getText();

        editor.setTextInBufferRange(range, toggleComments(text, ext, 'singleline'));
        editor.moveToBeginningOfLine();
    },

    toggleComments: function(text, ext, type) {
        var modifiedText;

        if (this.isCommented(text, ext, type)) {
            modifiedText = this.removeComment(text, ext, type);
        } else {
            modifiedText = this.addComment(text, ext, type);
        }

        return modifiedText;
    },

    isMultilineSelected: function(range) {
       return !range.isEmpty() && (range.start.row < range.end.row);
    },

    toggleCommentsForSingleLine: function(text, ext, editor) {
        var modifiedText = '',
            prefix = comment.singleline.prefix[ext];

        if (this.isSingleLineCommented(text, prefix)) {
            editor.deleteLine();
            modifiedText = this.replaceCommentedLine(text, prefix);
            editor.insertText(modifiedText);
            editor.moveUp();
        } else {
            editor.moveToBeginningOfLine();
            modifiedText = this.getCommentPrefix(prefix);
            editor.insertText(modifiedText);
        }

        return modifiedText;
    },

    toggleCommentsForUnsupportedMultiline: function(text, ext) {
        var modifiedText = '',
            prefix = comment.singleline.prefix[ext],
            lines = text.split('\n');

        lines.pop();
        lines.forEach(
            function(line) {
                if (this.isSingleLineCommented(line, prefix)) {
                    modifiedText += this.replaceCommentedLine(line, prefix);
                } else {
                    modifiedText += this.replaceUncommentedLine(line);
                }
            }.bind(this)
        );

        return modifiedText;
    },

    replaceUncommentedLine: function(text, prefix) {
        return this.getCommentPrefix(prefix) + line + this.DEFAULT_SUFFIX;
    },

    replaceCommentedLine: function(text, prefix) {
        return text.replace(this.getCommentPrefix(prefix), '') + '\n';
    },

    addComment: function(text, ext, type) {
        var phonemes = this.getPhonemes(type, ext);

        if (!phonemes) {
            return text;
        }

        return this.getCommentPrefix(phonemes.prefix) + text + phonemes.suffix;
    },

    removeComment: function(text, ext, type) {
        var phonemes = this.getPhonemes(type, ext),
            strippedText;

        strippedText = text.substr(phonemes.prefix.length, text.length);
        strippedText = strippedText.substr(
            0,
            strippedText.length - phonemes.suffix.length);

        return strippedText;
    },

    getCommentPrefix: function(prefix) {
        if (!prefix) {
            prefix = this.DEFAULT_PREFIX;
        }

        return prefix + this.COMMENT_SUFFIX;
    },

    isCommented: function(text, ext, type) {
        var phonemes = this.getPhonemes(type, ext),
            prefixLength = phonemes.prefix.length,
            suffixLength = phonemes.suffix.length,
            commentStartMatch, commentEndMatch;

        commentStartMatch = (
            text.trim().substr(0, prefixLength) === comment[type].prefix[ext]
        );
        commentEndMatch = (
            text.trim().substr(text.length - suffixLength, text.length) === comment[type].suffix[ext]
        );

        return commentStartMatch && commentEndMatch;
    },

    getPhonemes: function(type, ext) {
        if (!(comment[type].prefix.hasOwnProperty(ext) &&
             comment[type].suffix.hasOwnProperty(ext))) {
            return null;
        }

        return {
            prefix: comment[type].prefix[ext],
            suffix: comment[type].suffix[ext]
        };
    },

    isSingleLineCommented: function(text, prefix) {
        return text.trim().substr(0, prefix.length) === prefix;
    },

    getExtension: function(fileName) {
        var components = fileName.split('.');
        return components[components.length-1];
    },

    supportsMultiline: function(ext) {
        if (!comment.multiline.suffix.hasOwnProperty(ext)) {
            return false;
        }

        return comment.multiline.suffix[ext].length > 0;
    },

    isUnsupportedSingleLine: function(ext) {
        return this.UNSUPPORTED_SINGLE_LINE_EXTENSIONS.indexOf(ext) > -1;
    }
};
