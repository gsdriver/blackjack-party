//
// Saves attributes at the end of the session
//

'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

module.exports = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return ((request.type === 'IntentRequest') &&
      (request.intent.name === 'SessionEndedRequest'));
  },
  handle: function(handlerInput) {
    console.log('End session - saving attributes');
    return new Promise((resolve, reject) => {
      const attributes = handlerInput.attributesManager.getSessionAttributes();
      const event = handlerInput.requestEnvelope;
      const game = attributes[attributes.currentGame];

      if (game.players && (game.players.length > 0) && attributes.temp.hands) {
        // Get named players and button players
        const buttons = (attributes.temp.buttons) ? Object.keys(attributes.temp.buttons).length : 0;
        let named = 0;
        game.players.forEach((player) => {
          if (attributes.playerList[player].name) {
            named++;
          }
        });

        // Save the table to S3 - OK if this fails
        const data = {
          userId: event.session.user.userId,
          tableSize: game.players.length,
          hands: attributes.temp.hands,
          named: named,
          buttons: buttons,
        };
        s3.putObject({Body: JSON.stringify(data),
             Bucket: 'garrett-alexa-usage',
             Key: 'blackjackparty/' + Date.now() + '.txt'}, (err, data) => {
          done();
        });
      } else {
        done();
      }

      function done() {
        // If we have too many unnamed players, we'll prune the list to keep
        // the size of the attributes structure in check
        if (attributes.playerList && (Object.keys(attributes.playerList).length > 20)) {
          // OK, we'll take each unnamed player out and into an oldPlayers array
          const toRemove = [];
          let player;
          const currentPlayers = (game && game.players)
              ? game.players.map((x) => x.toString())
              : [];

          for (player in attributes.playerList) {
            if (player && !attributes.playerList[player].name
              && (currentPlayers.indexOf(player) == -1)) {
              // We'll remove this one
              toRemove.push(player);
            }
          }

          if (toRemove.length) {
            if (!attributes.oldPlayers) {
              attributes.oldPlayers = {total: 0, scores: []};
            }
            attributes.oldPlayers.total += toRemove.length;

            // Remove each old player
            toRemove.forEach((playerId) => {
              attributes.oldPlayers.scores.push({
                hands: attributes.playerList[playerId].hands,
                high: attributes.playerList[playerId].high,
              });

              attributes.playerList[playerId] = undefined;
            });

            attributes.oldPlayers.scores
              .sort((a, b) => (a.high == b.high) ? (b.hands - a.hands) : (b.high - a.high));
            attributes.oldPlayers.scores = attributes.oldPlayers.scores.slice(0, 5);
          }
        }

        // Clear and persist attributes
        attributes.temp = undefined;
        handlerInput.attributesManager.setPersistentAttributes(attributes);
        handlerInput.attributesManager.savePersistentAttributes();
        resolve();
      }
    });
  },
};
