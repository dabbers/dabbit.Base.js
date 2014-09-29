var ModeModificationType = require('./ModeModificationType');
var ModeType = require('./ModeType');

function Mode() {
    this.Character = '';

    this.Display = '';

    this.Argument = String.Empty;

    this.Type = ModeType.User;

    this.ModificationType = ModeModificationType.Adding;
}

module.exports = Mode;