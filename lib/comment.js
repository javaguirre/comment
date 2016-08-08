var comment = require('./comment.json'),
    utils = require('./comment-utils.js'),
    sprint = require('sprint').sprint;

module.exports = {

    activate: function() {
        atom.commands.add('atom-workspace', {
          'comment:toggle': this.toggle
        });
    },

    toggle: function() {
        var editor      = atom.workspace.getActivePaneItem(),
            fileName    = editor.getTitle(),
            range       = editor.getSelectedBufferRange(),
            selection   = editor.getLastSelection(),
            cursor      = editor.getLastCursor(),
            text        = selection.getText(),
            ext         = utils.getExtension(fileName);

        text = text || cursor.getCurrentBufferLine();

        // If more than one line is selected
        if (!range.isEmpty() && (range.start.row < range.end.row)) {

            // If file type supports multiline comments
            if (supportsMultiline(ext)) {
                editor.setTextInBufferRange(range, utils.toggleComments(text, ext, 'multiline'));

            // If file type does not support multiline comments
            } else {
                editor.setTextInBufferRange(range, utils.toggleCommentsForUnsupportedMultiline(text, ext));
            }

        // If file html style comments AND selection is empty OR only one line is selected
        // Enclose that line in html-style comments
    } else if (utils.isUnsupportedSingleLine(ext) && (range.isEmpty() || range.start.row === range.end.row)) {
            utils.toggleHtmlSingleLineOrEmptySelection(ext, editor);

        // Range is empty. Comment single line
        } else {
            utils.toggleCommentsForSingleLine(text, ext, editor, range);
        }
    }
};
