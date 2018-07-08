//
// Handles the intent to process help
//

'use strict';

const playgame = require('../PlayGame');
const bjUtils = require('../BlackjackUtils');

module.exports = {
  handleIntent: function() {
    const res = require('../' + this.event.request.locale + '/resources');
    let speech = playgame.getContextualHelp(this, !this.attributes.bot);
    if (!speech) {
      speech = res.strings.HELP_GENERIC_HELP;
    }
    speech = res.strings.HELP_ACHIEVEMENT_POINTS + speech;

    let cardContent = '';
    cardContent += res.strings.HELP_ACHIEVEMENT_CARD_TEXT;
    cardContent += res.strings.HELP_CARD_TEXT;
    bjUtils.emitResponse(this, null, null,
        speech, speech, res.strings.HELP_CARD_TITLE,
        cardContent);
  },
};
