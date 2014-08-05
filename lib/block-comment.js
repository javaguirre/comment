module.exports = {
    activate: function() {
        atom.workspaceView.command('block-comment:insert', this.insert);
    },

    insert: function() {
        var editor = atom.workspace.activePaneItem,
            range = editor.getSelectedBufferRange(),
            selection = editor.getSelection(),
            text = selection.getText();

        editor.setTextInBufferRange(range, '/*' + text + '*/');
    }
};
