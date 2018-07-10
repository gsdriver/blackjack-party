//
// Handles "unhandled" intents - often because the user is trying to
// do an action that isn't allowed at this point in the flow
//

'use strict';

const playgame = require('../PlayGame');

module.exports = {
  canHandle: function(handlerInput) {
    // This one is last in the list
    return true;
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../' + event.request.locale + '/resources');

    // Echo back the action that we heard, why this isn't valid at this time,
    // and what the possible actions are for them to say
    if (!event.request.intent) {
      // Something we really don't handle
      console.log('Error - Unhandled didn\'t get an intent');
      handlerInput.responseBuilder
        .speak(res.strings.INTERNAL_ERROR)
        .reprompt(res.strings.ERROR_REPROMPT);
    } else {
      let speech = res.buildUnhandledResponse(event.request.intent,
          playgame.getState(attributes));
      const reprompt = playgame.getContextualHelp(event, attributes);

      speech += reprompt;
      handlerInput.responseBuilder
        .speak(speech)
        .reprompt(reprompt);
    }
  },
};
