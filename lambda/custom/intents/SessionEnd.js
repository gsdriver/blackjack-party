//
// Saves attributes at the end of the session
//

'use strict';

module.exports = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return ((request.type === 'IntentRequest') &&
      (request.intent.name === 'SessionEndedRequest'));
  },
  handle: function(handlerInput) {
    console.log('End session - saving attributes');
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.temp = undefined;
    handlerInput.attributesManager.setPersistentAttributes(attributes);
    handlerInput.attributesManager.savePersistentAttributes();
  },
};
