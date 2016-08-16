var utils = require('./comment-utils.js'),
    sprint = require('sprint').sprint;

module.exports = {
    config: {
        commentSuffix: {
          title: 'Comment suffix',
          description: 'It goes between the comment string and the code, default blank space',
          type: 'string',
          default: ' '
        }
    },

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

        utils.toggle(range, text, ext, editor);
    }
};
