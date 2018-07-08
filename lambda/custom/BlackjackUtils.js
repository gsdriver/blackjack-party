//
// Set of utility functions
//

'use strict';

module.exports = {
  emitResponse: function(context, error, response, speech, reprompt, cardTitle, cardText) {
    if (error) {
      const res = require('./' + context.event.request.locale + '/resources');
      console.log('Speech error: ' + error);
      context.responseBuilder.speak(error)
        .reprompt(res.strings.ERROR_REPROMPT);
    } else if (response) {
      context.responseBuilder.speak(response);
    } else if (cardTitle) {
      context.responseBuilder.speak(speech)
        .reprompt(reprompt)
        .withSimpleCard(cardTitle, cardText);
    } else {
      context.responseBuilder.speak(speech)
        .reprompt(reprompt);
    }
  },
  // Figures out what state of the game we're in
  getState: function(attributes) {
    const game = attributes[attributes.currentGame];

    // New game - ready to start a new game
    if (game.possibleActions.indexOf('bet') >= 0) {
      if (attributes.newUser) {
        return 'FIRSTTIMEPLAYER';
      }
      return 'NEWGAME';
    } else if (game.suggestion) {
      return 'SUGGESTION';
    } else if (game.possibleActions.indexOf('noinsurance') >= 0) {
      return 'INSURANCEOFFERED';
    } else {
      return 'INGAME';
    }
  },
};
