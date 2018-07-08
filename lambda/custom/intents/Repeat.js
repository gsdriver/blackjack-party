//
// Handles the intent to process repeating status
//

'use strict';

const playgame = require('../PlayGame');
const bjUtils = require('../BlackjackUtils');

module.exports = {
  handleIntent: function() {
    const output = playgame.readCurrentHand(this.attributes, this.event.request.locale);
    const resources = require('../' + this.event.request.locale + '/resources');
    const game = this.attributes[this.attributes.currentGame];
    const speech = resources.strings.YOUR_BANKROLL_TEXT.replace('{0}', game.bankroll) + output.speech;
    bjUtils.emitResponse(this, null, null, speech, output.reprompt);
  },
};
