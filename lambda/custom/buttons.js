//
// Echo Button support functions
//

'use strict';

module.exports = {
  supportButtons: function(handlerInput) {
    const localeList = ['en-US', 'en-CA', 'en-IN', 'en-GB'];
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const locale = handlerInput.requestEnvelope.request.locale;

    return (!process.env.NOBUTTONS &&
      (localeList.indexOf(locale) >= 0) &&
      (attributes.platform !== 'google') && !attributes.bot);
  },
  getPressedButton: function(request, attributes) {
    const gameEngineEvents = request.events || [];
    let result;

    gameEngineEvents.forEach((engineEvent) => {
      // in this request type, we'll see one or more incoming events
      // corresponding to the StartInputHandler we sent above
      if (engineEvent.name === 'timeout') {
        console.log('Timed out waiting for button');
      } else if (engineEvent.name === 'button_down_event') {
        // save id of the button that triggered event
        // unless they only want a new (unseen) button
        const buttonId = engineEvent.inputEvents[0].gadgetId;
        console.log('Received button down request');
        attributes.usedButton = true;
        result = 'new';

        // Is this a new button?
        if (buttonId === attributes.temp.buttonId) {
          result = 'last';
        } else if (attributes.temp.buttons) {
          let button;
          for (button in attributes.temp.buttons) {
            if (button && (attributes.temp.buttons[button].id === buttonId)) {
              result = 'existing';
            }
          }
        }
        attributes.temp.buttonId = buttonId;
      }
    });

    return result;
  },
  getPlayerColor: function(player) {
    const colors = ['00FE10', 'FF0000', '0000FF', 'FFFF00'];
    return ((player >= 0) && (player < colors.length)) ? colors[player] : 'FFFFFF';
  },
  startInputHandler: function(handlerInput) {
    if (module.exports.supportButtons(handlerInput)) {
      // We'll allow them to press the button again
      handlerInput.responseBuilder.addDirective({
        'type': 'GameEngine.StartInputHandler',
        'timeout': 30000,
        'recognizers': {
          'button_down_recognizer': {
            'type': 'match',
            'fuzzy': false,
            'anchor': 'end',
            'pattern': [{
              'action': 'down',
            }],
          },
        },
        'events': {
          'button_down_event': {
            'meets': ['button_down_recognizer'],
            'reports': 'matches',
            'shouldEndInputHandler': false,
          },
          'timeout': {
            'meets': ['timed out'],
            'reports': 'history',
            'shouldEndInputHandler': false,
          },
        },
      });
    }
  },
  colorButton: function(handlerInput, buttonId, buttonColor) {
    if (module.exports.supportButtons(handlerInput)) {
      // Pulse the button so they know it's their turn
      // Followed by keeping the button lit their color
      const buttonIdleDirective = {
        'type': 'GadgetController.SetLight',
        'version': 1,
        'targetGadgets': [buttonId],
        'parameters': {
          'animations': [{
            'repeat': 1,
            'targetLights': ['1'],
            'sequence': [
              {
                'durationMs': 400,
                'color': buttonColor,
                'blend': true,
              },
              {
                'durationMs': 300,
                'color': '000000',
                'blend': true,
              },
              {
                'durationMs': 400,
                'color': buttonColor,
                'blend': true,
              },
              {
                'durationMs': 300,
                'color': '000000',
                'blend': true,
              },
              {
                'durationMs': 30000,
                'color': buttonColor,
                'blend': false,
              },
            ],
          }],
          'triggerEvent': 'none',
          'triggerEventTimeMs': 0,
        },
      };

      handlerInput.responseBuilder
        .addDirective(buttonIdleDirective);
    }
  },
  disableButtons: function(handlerInput) {
    if (module.exports.supportButtons(handlerInput)) {
      const disableButtonDirective = {
        'type': 'GadgetController.SetLight',
        'version': 1,
        'targetGadgets': [],
        'parameters': {
          'animations': [{
            'repeat': 1,
            'targetLights': ['1'],
            'sequence': [
              {
                'durationMs': 400,
                'color': '000000',
                'blend': false,
              },
            ],
          }],
          'triggerEvent': 'none',
          'triggerEventTimeMs': 0,
        },
      };

      handlerInput.responseBuilder
        .addDirective(disableButtonDirective);
    }
  },
  addButtons: function(handlerInput) {
    if (module.exports.supportButtons(handlerInput)) {
      // Build idle breathing animation that will play immediately
      // and button down animation for when the button is pressed
      module.exports.startInputHandler(handlerInput);
      const breathAnimation = buildBreathAnimation('000000', 'FFFFFF', 30, 1200);
      const idleDirective = {
        'type': 'GadgetController.SetLight',
        'version': 1,
        'targetGadgets': [],
        'parameters': {
          'animations': [{
            'repeat': 100,
            'targetLights': ['1'],
            'sequence': breathAnimation,
          }],
          'triggerEvent': 'none',
          'triggerEventTimeMs': 0,
        },
      };

      const buttonDownDirective = {
        'type': 'GadgetController.SetLight',
        'version': 1,
        'targetGadgets': [],
        'parameters': {
          'animations': [{
            'repeat': 1,
            'targetLights': ['1'],
            'sequence': [{
              'durationMs': 500,
              'color': 'FFFF00',
              'intensity': 255,
              'blend': false,
            }],
          }],
          'triggerEvent': 'buttonDown',
          'triggerEventTimeMs': 0,
        },
      };

      handlerInput.responseBuilder
        .addDirective(idleDirective)
        .addDirective(buttonDownDirective);
    }
  },
};

function buildBreathAnimation(fromRgbHex, toRgbHex, steps, totalDuration) {
  const halfSteps = steps / 2;
  const halfTotalDuration = totalDuration / 2;
  return buildSeqentialAnimation(fromRgbHex, toRgbHex, halfSteps, halfTotalDuration)
    .concat(buildSeqentialAnimation(toRgbHex, fromRgbHex, halfSteps, halfTotalDuration));
};

function buildSeqentialAnimation(fromRgbHex, toRgbHex, steps, totalDuration) {
  const fromRgb = parseInt(fromRgbHex, 16);
  let fromRed = fromRgb >> 16;
  let fromGreen = (fromRgb & 0xff00) >> 8;
  let fromBlue = fromRgb & 0xff;

  const toRgb = parseInt(toRgbHex, 16);
  const toRed = toRgb >> 16;
  const toGreen = (toRgb & 0xff00) >> 8;
  const toBlue = toRgb & 0xff;

  const deltaRed = (toRed - fromRed) / steps;
  const deltaGreen = (toGreen - fromGreen) / steps;
  const deltaBlue = (toBlue - fromBlue) / steps;

  const oneStepDuration = Math.floor(totalDuration / steps);

  const result = [];

  for (let i = 0; i < steps; i++) {
    result.push({
      'durationMs': oneStepDuration,
      'color': '' + n2h(fromRed) + n2h(fromGreen) + n2h(fromBlue),
      'intensity': 255,
      'blend': true,
    });
    fromRed += deltaRed;
    fromGreen += deltaGreen;
    fromBlue += deltaBlue;
  }

  return result;
};

// number to hex with leading zeroes
function n2h(n) {
  return ('00' + (Math.floor(n)).toString(16)).substr(-2);
};
