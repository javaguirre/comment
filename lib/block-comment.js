var comment = require('./comment.json');

module.exports = {

    activate: function() {
        atom.workspaceView.command('block-comment:toggle', this.toggle);
    },

    toggle: function() {
        var editor = atom.workspace.activePaneItem,
            fileName = editor.getTitle(),
            range = editor.getSelectedBufferRange(),
            selection = editor.getSelection(),
            text = selection.getText(),
            isHtml = getExtension(fileName).indexOf('htm') > -1,
            prefix, suffix;

        prefix = comment.prefix[getExtension(fileName)];
        suffix = comment.suffix[getExtension(fileName)];

        editor.setTextInBufferRange(range, prefix + text + suffix);
    }

};


//TODO: Match against substring
function isCommented(text) {
    return ((text.indexOf('/*') === 0) && (text.indexOf('*/') === text.length - 2));
}

function getExtension(fileName) {

    var components = fileName.split('.');
    return components[components.length-1];

}
