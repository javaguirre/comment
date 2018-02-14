var comment = require('./comment.json');

module.exports = {
    UNSUPPORTED_SINGLE_LINE_EXTENSIONS: ['htm', 'html', 'md', 'css', 'xml'],
    DEFAULT_PREFIX: '#',
    DEFAULT_SUFFIX: '\n',
    LINE_REGEX: /(\s*)(.*)/i,

    toggle: function(range, text, ext, editor) {
        if (this.isMultilineSelected(range)) {
            this.toggleMultilineCommentsWithRange(editor, range, text, ext);
        } else {
            this.toggleSingleCommentsWithRange(editor, range, text, ext);
        }
    },

    toggleMultilineCommentsWithRange: function(editor, range, text, ext) {
        if (this.supportsMultiline(ext)) {
            modifiedText = this.toggleComments(text, ext, 'multiline');
        } else {
            modifiedText = this.toggleCommentsForUnsupportedMultiline(
                text, ext);
        }

        editor.setTextInBufferRange(range, modifiedText);
    },

    toggleSingleCommentsWithRange: function(editor, range, text, ext) {
        if (this.isUnsupportedSingleLine(ext) &&
            (range.isEmpty() ||
             range.start.row === range.end.row)
        ) {
            this.toggleHtmlSingleLineOrEmptySelection(ext, editor);
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

        editor.setTextInBufferRange(
            range, this.toggleComments(text, ext, 'singleline'));
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

        editor.deleteLine();
        modifiedText = this.processSingleLineComment(text, prefix);

        editor.insertText(modifiedText);
        editor.moveUp();

        return modifiedText;
    },

    toggleCommentsForUnsupportedMultiline: function(text, ext) {
        var modifiedText = '',
            prefix = comment.singleline.prefix[ext],
            lines = text.split('\n');

        lines.pop();
        lines.forEach(
            function(line) {
                modifiedText += this.processSingleLineComment(line, prefix);
            }.bind(this)
        );

        return modifiedText;
    },

    processSingleLineComment: function(text, prefix) {
        var modifiedText;

        // FIXME This language is not supported
        // we need to process this before arriving here
        if (!prefix) {
            return text;
        }

        if (this.isSingleLineCommented(text, prefix)) {
            modifiedText = this.replaceCommentedLine(text, prefix);
        } else {
            modifiedText = this.replaceUncommentedLine(text, prefix);
        }

        return modifiedText;
    },

    replaceUncommentedLine: function(text, prefix) {
        line = this.getTextComponents(text);

        return (
            line.whitespaces + this.getCommentPrefix(prefix) +
            line.text + this.DEFAULT_SUFFIX
        );
    },

    replaceCommentedLine: function(text, prefix) {
        line = this.getTextComponents(text);

        return (
            line.whitespaces +
            line.text.replace(this.getCommentPrefix(prefix), '') +
            this.DEFAULT_SUFFIX
        );
    },

    getTextComponents: function(text) {
        match = this.LINE_REGEX.exec(text);

        return {
            whitespaces: match[1],
            text: match[2]
        };
    },

    addComment: function(text, ext, type) {
        var phonemes = this.getPhonemes(type, ext);

        if (!phonemes) {
            return text;
        }

        text_components = this.getTextComponents(text);

        return (
            text_components.whitespaces +
            this.getCommentPrefix(phonemes.prefix, type) +
            text + text_components.whitespaces +
            phonemes.suffix + this.DEFAULT_SUFFIX
        );
    },

    removeComment: function(text, ext, type) {
        var phonemes = this.getPhonemes(type, ext),
            strippedText;

        text_components = this.getTextComponents(text);
        strippedText = text.trim();
        strippedText = strippedText.substr(
            phonemes.prefix.length,
            strippedText.length
        );
        suffix_length = (
            phonemes.suffix.length + text_components.whitespaces.length);
        strippedText = strippedText.substr(
            0,
            strippedText.length - suffix_length
        );

        return strippedText;
    },

    getCommentPrefix: function(prefix, type) {
        if (!prefix) {
            prefix = this.DEFAULT_PREFIX;
        }

        if (type === 'multiline') {
            return prefix;
        }

        return prefix + this.getCommentSuffix();
    },

    getCommentSuffix: function() {
        return atom.config.get('comment.commentSuffix');
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
            text.trim().substr(text.trim().length - suffixLength, text.length) === comment[type].suffix[ext]
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
        if (!prefix) {
            return false;
        }

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
