//
// Handles the intent to process a 'Yes' response
//

'use strict';

const playgame = require('../PlayGame');
const bjUtils = require('../BlackjackUtils');

module.exports = {
  handleIntent: function() {
    playgame.playBlackjackAction(this.attributes,
      this.event.request.locale, {action: 'insurance'},
      (error, response, speech, reprompt) => {
      bjUtils.emitResponse(this, error, response, speech, reprompt);
    });
  },
};
