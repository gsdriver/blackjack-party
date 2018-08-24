//
// Handles "unhandled" intents - often because the user is trying to
// do an action that isn't allowed at this point in the flow
//

'use strict';

const utils = require('../utils');

module.exports = {
  canHandle: function(handlerInput) {
    // This one is last in the list
    return true;
  },
  handle: function(handlerInput) {
    const event = handlerInput.requestEnvelope;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const res = require('../resources')(event.request.locale);

    // Echo back the action that we heard, why this isn't valid at this time,
    // and what the possible actions are for them to say
    if (event.request.type === 'GameEngine.InputHandlerEvent') {
      // Probably a timeout - fail silently
      console.log('Unhandled button event: ' + JSON.stringify(event.request.events));
    } else if (!event.request.intent) {
      // Something we really don't handle
      console.log('Error - Unhandled didn\'t get an intent');
      return handlerInput.responseBuilder
        .speak(res.strings.INTERNAL_ERROR)
        .reprompt(res.strings.ERROR_REPROMPT)
        .getResponse();
    } else {
      let speech = res.buildUnhandledResponse(event.request.intent, attributes);
      const reprompt = utils.getContextualHelp(event, attributes);

      speech += reprompt;
      return handlerInput.responseBuilder
        .speak(speech)
        .reprompt(reprompt)
        .getResponse();
    }
  },
};
