//
// Localized resources
//

const common = {
  // From AddPlayer.js
  'ADD_PLAYER': 'Say the name of the <say-as interpret-as="ordinal">{0}</say-as> player <break time=\'200ms\'/> add a player to leave this player unnamed <break time=\'200ms\'/> or deal to start the game. ',
  'ADD_LAST_PLAYER': 'Say the name of the <say-as interpret-as="ordinal">{0}</say-as> player <break time=\'200ms\'/> or deal to start the game.',
  'ADD_PLAYER_REPROMPT': 'Say the name of the player to add.',
  'ADD_PLAYER_TABLE_FULL': 'Sorry the table is full with four players. Say deal to start the game.',
  'ADD_PLAYER_TABLE_FULL_REPROMPT': 'Say deal to start the game.',
  'ADD_PLAYER_UKNOWN': 'Sorry, I didn\'t get the name of a person to add. Try saying the name again. ',
  // From PlayerName.js
  'PLAYER_GOTNAME': 'I heard {0}, is that correct?',
  'PLAYER_GOTNAME_REPROMPT': 'Say yes if {0} is the name you want to add.',
  // From ConfirmName.js
  'CONFIRM_MAX_PLAYERS': 'The table is full with four players. Say deal to start the game.',
  'CONFIRM_ADD_PLAYER': 'Say add a player to add more players, or deal to start the game.',
  'CONFIRM_WELCOME_BACK': 'Welcome back {0}. ',
  'CONFIRM_DUPLICATE_PLAYER': 'Sorry {0} is already at this table and each player must have a unique name. <break time=\'200ms\'/> ',
  'CONFIRM_DUPLICATE_REPROMPT': 'Say a different name <break time=\'200ms\'/> add a player to leave this player unnamed <break time=\'200ms\'/> or deal to start the game.',
  // From BlackjackUtils.js
  'ERROR_REPROMPT': 'What else can I help with?',
  // From BetAmount.js
  'BAD_BET_FORMAT': 'I can\'t place a bet for {0}',
  'BET_ERROR_REPROMPT': 'Say an amount you would like to bet. ',
  // From Blackjack.js
  'BLACKJACKINTENT_NO_ACTION': 'I\'m sorry, I didn\'t catch that action. Please say what you want to do on this hand like hit or stand. What else can I help with?',
  'BLACKJACKINTENT_UNKNOWN_ACTION': 'I\'m sorry, I don\'t understand how to {0}. Please provide an action like hit or stand. What else can I help with?',
  // From ChangeBets.js
  'CHANGEBETS_REPROMPT': 'Say the amount you would like to bet. ',
  // From Exit.js
  'EXIT_GOODBYE': 'Goodbye.',
  'EXIT_GOODBYE_NAMES': 'Goodbye {0}.',
  // From HighScore.js
  'HIGHSCORE_NONAME': 'an unnamed player',
  'HIGHSCORE_REPROMPT': 'What else can I help you with?',
  'HIGHSCORE_LEADERS': 'The top {0} peak bankrolls are {1}. ',
  // From Help.js
  'HELP_CHANGING_PLAYERS': 'At the start of the game, set your table by saying add a player. You can then give each player a name, saying deal when you are ready to play. To change each player\'s bet, say change bets and then the amount you want each person to bet. ',
  'HELP_GENERIC_HELP': 'You can play a game by saying Deal <break time=\'200ms\'/> or you can say enable training mode if you would like me to prompt when your play differs from Basic Strategy. <break time=\'300ms\'/> Now, what can I help you with?',
  'HELP_CARD_TITLE': 'Blackjack Party Commands',
  'HELP_CARD_TEXT': 'When you start the skill, say DEAL to continue with an existing table or ADD A PLAYER to reset the players at the table. You can only change the players at the start of a round. If you want to change the bets for each player, say CHANGE BETS which will allow you to set an amount to bet for each player separately.\nYou can say DEAL to start the game. You can say READ HIGH SCORES to hear the peak bankrolls for each member of your party.\nDuring a hand, ask WHAT SHOULD I DO to hear the Basic Strategy suggestion.\nSay READ THE RULES if you would like to hear the rules of the game.',
  // From Launch.js
  'LAUNCH_WELCOME': '{"standard":"Thanks for joining Blackjack Party! "}',
  'LAUNCH_START_GAME': 'Say add a player to start a new table or deal to start a new game with this table',
  'LAUNCH_START_HAND_INPROGRESS': 'Say add a player to start a new table or pick up where you left off. ',
  'LAUNCH_ADD_PLAYER': 'This skill lets up to four people play at a Blackjack table. What is the name of the first player? ',
  'LAUNCH_ADD_PLAYER_BUTTON': 'If you have an Echo button, you can also press the button to join as an unnamed player.',
  'LAUNCH_TABLE_INPROGRESS': 'You have a table in progress ',
  'LAUNCH_TABLE_NAMES': 'with {0} players including {1}. ',
  'LAUNCH_TABLE_PLAYERS': 'with {0} players. ',
  // From Rules.js
  'RULES_CARD_TITLE': 'Blackjack Rules',
  // From Training.js
  'TRAINING_ON': 'Training mode turned on. I will let you know when your play differs from Basic Strategy. ',
  'TRAINING_OFF': 'Training mode turned off. ',
  'TRAINING_REPROMPT': 'What can I help you with?',
  // From PlayGame.js
  'CURRENT_PLAYER': '<say-as interpret-as="ordinal">{0}</say-as> player <break time=\'200ms\'/> ',
  'PROMPT_TRAINING': 'You can say enter training mode if you would like me to tell you when your play differs from Basic Strategy',
  'PROMPT_LEADER_BOARD': 'You can say read high scores to hear the leader board. ',
  'PROACTIVE_SUGGESTION': ' I\'ve noticed you haven\'t {0} recently and wanted to remind you that the book would say you should {1} on this hand.',
  'SUGGEST_OPTIONS': 'You should {0}|The book says you should {0}|The book would tell you to {0}|According to Basic Strategy you should {0}|The book would suggest that you {0}|I think you should {0}|Basic Strategy would suggest you {0}',
  'SUGGEST_TURNOVER': 'I can\'t give a suggestion when the game is over',
  'SUGGESTED_PLAY': 'I would recommend you {0}. |The book would tell you to {0}. |Basic Strategy would suggest you {0}. |Maybe you should {0} instead. ',
  'SUGGESTED_PLAY_REPROMPT': 'Would you like to {0}?',
  'REPORT_ERROR': 'There was an error: {0}',
  'INVALID_ACTION': 'I\'m sorry, {0} is not a valid action at this time. ',
  'READ_ABOUT_LEADER_BOARD': 'Say read high scores to hear the leader board. ',
  'HELP_TAKE_INSURANCE': 'You can say yes to take insurance or no to decline insurance.',
  'HELP_TAKE_INSURANCE_BLACKJACK': 'Since you have a blackjack, can you say yes to get paid your bet, or no in which case you push if I have blackjack.',
  'HELP_INSURANCE_INSUFFICIENT_BANKROLL': 'You don\'t have enough money to take insurance - say no to decline insurance.',
  'HELP_YOU_CAN_SAY': 'You can say {0}.',
  'HELP_YOU_CAN_SAY_LEADER': 'read high scores',
  'HELP_YOU_CAN_SAY_ENABLE_TRAINING': 'enable training mode',
  'HELP_YOU_CAN_SAY_YESNO': 'You can say yes or no',
  'HELP_MORE_OPTIONS': ' For more options, please check the Alexa companion application.<break time=\'300ms\'/> What can I help you with?',
  'INTERNAL_ERROR': 'Sorry, internal error. What else can I help with?',
  'SPEECH_ERROR_CODE': 'Error code {0}',
  'ASK_TAKE_INSURANCE': 'Do you want to take insurance?  Say yes or no.',
  'ASK_TAKE_INSURANCE_BLACKJACK': 'Even money?  Say yes or no.',
  'ASK_POSSIBLE_ACTIONS': 'Would you like to {0}?',
  'ASK_WHAT_TO_DO': 'What would you like to do?',
  'ASK_PLAY_AGAIN': 'Would you like to play again?',
  'ASK_SAY_BET': 'Say bet to start the game.',
  'CARD_DEAL_SOUND': '<audio src=\"https://s3-us-west-2.amazonaws.com/alexasoundclips/dealcard.mp3\"/> ',
  'RESULT_AFTER_HIT_BUST': 'You got {0} and busted. ',
  'RESULT_AFTER_HIT_NOBUST': 'You got {0} for a total of {1}. ',
  'RESULT_BANKROLL_RESET': 'Bankroll reset',
  'RESULT_DECK_SHUFFLED': 'Deck shuffled',
  'DEALER_HOLE_CARD': 'I have {0} down',
  'DEALER_BUSTED': ' and busted.',
  'DEALER_BLACKJACK': ' and have Blackjack.',
  'DEALER_TOTAL': ' for a total of {0}.',
  'DEALER_DRAW': '. I drew ',
  'DEALER_SHOWING': ' I am showing {0}.',
  'SPLIT_TENS': 'You split tens. ',
  'SPLIT_PAIR': 'You split a pair of {0}. ',
  'SURRENDER_RESULT': 'You surrendered. ',
  'DEALER_HAD_BLACKJACK': 'I had a blackjack. ',
  'DEALER_NO_BLACKJACK': 'I didn\'t have a blackjack. ',
  'READHAND_PLAYER_TOTAL_ACTIVE_BLACKJACK': 'You have {0} for a blackjack. ',
  'READHAND_PLAYER_TOTAL_END_BLACKJACK': 'You had {0} for a blackjack. ',
  'READHAND_PLAYER_BUSTED_SOFT': 'You busted with {0} for a total of soft {1}. ',
  'READHAND_PLAYER_TOTAL_ACTIVE_SOFT': 'You have {0} for a total of soft {1}.  ',
  'READHAND_PLAYER_TOTAL_END_SOFT': 'You had {0} for a total of soft {1}.  ',
  'READHAND_PLAYER_BUSTED': 'You busted with {0} for a total of {1}.  ',
  'READHAND_PLAYER_TOTAL_ACTIVE': 'You have {0} for a total of {1}.  ',
  'READHAND_PLAYER_TOTAL_END': 'You had {0} for a total of {1}.  ',
  'READHAND_DEALER_ACTIVE': 'I have {0} showing.',
  'READHAND_DEALER_DONE': 'I had {0} showing. ',
  'RULES_DECKS': '{0} deck game. ',
  'RULES_HIT_SOFT17': 'Dealer hits on soft 17. ',
  'RULES_STAND_SOFT17': 'Dealer stands on soft 17. ',
  'RULES_RESPLIT_ACES': 'Can resplit Aces. ',
  'RULES_SPLIT_NOT_ALLOWED': 'Splitting hands is not allowed. ',
  'RULES_NUMBER_OF_SPLITS': 'Split up to {0} hands. ',
  'RULES_DAS_ALLOWED': 'Double after split allowed. ',
  'RULES_DAS_NOT_ALLOWED': 'Double after split not allowed. ',
  'RULES_DOUBLE': 'Double down {0}. ',
  'RULES_BLACKJACK': 'Blackjack pays {0}. ',
  'RULES_SURRENDER_OFFERED': 'Surrender allowed. ',
  'RULES_NO_SURRENDER': 'Surrender not offered. ',
  'PLAYER_HIT_BUSTED': 'Sorry, it\'s a {0}. You busted. |You got {0} and busted. |You got {0} and busted. ',
  'PLAYER_HIT_NOTBUSTED_SOFT': 'You got {0} for a total of soft {1}. |Here\'s {0} for a total of soft {1}. |I have {0} for you giving you soft {1}. ',
  'PLAYER_HIT_NOTBUSTED': 'You got {0} for a total of {1}. |Here\'s {0} for a total of {1}. |I have {0} for you giving you {1}. ',
  'GOOD_HIT_OPTIONS': 'I have {0} for you giving you {1}. Not bad! |You got {0} for a total of {1}. Good hit. |Here\'s {0} for a total of {1}. ',
  'GREAT_HIT_OPTIONS': 'Look at this, I have {0} giving you {1}. |It\'s {0} for a total of {1}! Nice hit! |Here\'s a beauty, {0} for a total of {1}. ',
};

const dollar = {
  // From BetAmount.js
  'BET_AMOUNT_SET': 'Bet set to ${0}. ',
  'BET_BELOW_MIN': 'A bet of ${0} is below the table minimum of ${1}. ',
  'BET_ABOVE_BANKROLL': 'A bet of ${0} exceeds you bankroll of ${1}. ',
  'BET_ABOVE_MAX': 'A bet of ${0} is above the table maximum of ${1}. ',
  // From HighScore.js
  'HIGHSCORE_LEADER_FORMAT': '{0} at ${1}',
  // From PlayGame.js
  'PLAYER_BET_TEXT': '{0} bet ${1} ',
  'EVERYONE_BET_TEXT': 'Everyone bet ${0}. ',
  'YOUR_BANKROLL_TEXT': 'You have ${0}. ',
  'RULES_BET_RANGE': 'Bet from ${0} to ${1}. ',
};

const pound = {
  // From BetAmount.js
  'BET_AMOUNT_SET': 'Bet set to £{0}. ',
  'BET_BELOW_MIN': 'A bet of £{0} is below the table minimum of £{1}. ',
  'BET_ABOVE_BANKROLL': 'A bet of £{0} exceeds you bankroll of £{1}. ',
  'BET_ABOVE_MAX': 'A bet of £{0} is above the table maximum of £{1}. ',
  // From HighScore.js
  'HIGHSCORE_LEADER_FORMAT': '{0} at £{1}',
  // From PlayGame.js
  'PLAYER_BET_TEXT': '{0} bet £{1} ',
  'EVERYONE_BET_TEXT': 'Everyone bet £{0}. ',
  'YOUR_BANKROLL_TEXT': 'You have £{0}. ',
  'RULES_BET_RANGE': 'Bet from £{0} to £{1}. ',
};

const resources = {
  'en-US': {
    'translation': Object.assign({}, common, dollar),
  },
  'en-GB': {
    'translation': Object.assign({}, common, pound),
  },
};

const utils = (locale) => {
  let translation;
  if (resources[locale]) {
    translation = resources[locale].translation;
  } else {
    translation = resources['en-US'].translation;
  }

  return {
    strings: translation,
    pickRandomOption: function(res) {
      if (res && translation[res]) {
        const options = translation[res].split('|');
        return options[Math.floor(Math.random() * options.length)];
      } else {
        return undefined;
      }
    },
    getBlackjackAction: function(actionSlot) {
      const actionMapping = {'hit': 'hit', 'take a hit': 'hit', 'hit me': 'hit', 'take one': 'hit', 'take 1': 'hit',
        'stand': 'stand', 'stay': 'stand', 'done': 'stand',
        'surrender': 'surrender', 'give up': 'surrender',
        'double': 'double', 'double down': 'double',
        'split': 'split',
        'shuffle': 'shuffle', 'shuffle deck': 'shuffle',
        'reset': 'resetbankroll', 'reset bankroll': 'resetbankroll',
        'bet': 'deal', 'deal': 'deal'};
      const action = actionMapping[actionSlot.value.toLowerCase()];

      // Look it up in lowercase
      return (action == undefined) ? null : action;
    },
    mapChangeValue: function(value) {
      const valueMapping = {'on': true, 'off': false, 'enable': true, 'disable': false, 'enabled': true, 'disabled': false,
        '3 to 2': 0.5, 'three to two': 0.5, '6 to 5': 0.2, 'six to five': 0.2, 'even': 0, 'even money': 0,
        'one deck': 1, 'two decks': 2, 'four decks': 4, 'six decks': 6, 'eight decks': 8,
        'two deck': 2, 'four deck': 4, 'six deck': 6, 'eight deck': 8,
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'eight': 8,
        '1': 1, '2': 2, '3': 3, '4': 4, '6': 6, '8': 8};
      return valueMapping[value];
    },
    mapChangeRule: function(rule) {
      const ruleMapping = {'hit soft seventeen': 'hitSoft17', 'soft seventeen': 'hitSoft17', 'dealer hits seventeen': 'hitSoft17',
        'hit seventeen': 'hitSoft17', 'hits seventeen': 'hitSoft17',
        'dealer hit seventeen': 'hitSoft17', 'dealer hits soft seventeen': 'hitSoft17', 'dealer hit soft seventeen': 'hitSoft17',
        'hit soft 17': 'hitSoft17', 'soft 17': 'hitSoft17', 'dealer hits 17': 'hitSoft17',
        'hit 17': 'hitSoft17', 'hits 17': 'hitSoft17',
        'dealer hit 17': 'hitSoft17', 'dealer hits soft 17': 'hitSoft17', 'dealer hit soft 17': 'hitSoft17',
        'surrender': 'surrender',
        'double': 'double', 'double down': 'double', 'double after split': 'doubleaftersplit',
        'resplit aces': 'resplitAces',
        'blackjack pays': 'blackjackBonus', 'blackjack bonus': 'blackjackBonus', 'number of decks': 'numberOfDecks',
        'decks': 'numberOfDecks', 'deck count': 'numberOfDecks', 'number of splits': 'maxSplitHands',
        'number of split hands': 'maxSplitHands', 'split hands': 'maxSplitHands'};
      return ruleMapping[rule];
    },
    mapActionToSuggestion: function(action) {
      const actionMapping = {'insurance': 'take insurance', 'noinsurance': 'not take insurance', 'hit': 'hit',
                      'stand': 'stand', 'split': 'split', 'double': 'double', 'surrender': 'surrender'};
      return actionMapping[action];
    },
    mapActionPastTense: function(action) {
      const actionMapping = {'insurance': 'taken insurance', 'noinsurance': 'not taken insurance', 'hit': 'hit',
                      'stand': 'stood', 'split': 'split', 'double': 'doubled', 'surrender': 'surrendered'};
      return actionMapping[action];
    },
    mapServerError: function(error) {
      let errorMapping;

      if (locale == 'en-GB') {
        errorMapping = {'bettoosmall': 'Your bet is below the minimum of £5',
                        'bettoolarge': 'Your bet is above the maximum of £1000',
                        'betoverbankroll': 'Your bet is more than your available bankroll'};
      } else {
        errorMapping = {'bettoosmall': 'Your bet is below the minimum of $5',
                        'bettoolarge': 'Your bet is above the maximum of $1000',
                        'betoverbankroll': 'Your bet is more than your available bankroll'};
      }
      return (errorMapping[error] ? errorMapping[error] : 'Internal error');
    },
    readCard: function(card, withArticle, readSuit) {
      const names = ['none', 'ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'jack', 'queen', 'king'];
      const suits = {'C': 'clubs', 'D': 'diamonds', 'H': 'hearts', 'S': 'spades'};
      const articleNames = ['none', 'an ace', 'a two', 'a three', 'a four', 'a five', 'a six', 'a seven', 'an eight', 'a nine', 'a ten', 'a jack', 'a queen', 'a king'];
      let result;

      if (withArticle === 'article') {
        result = articleNames[card.rank];
      } else {
        result = names[card.rank];
      }

      if (readSuit) {
        result += (' of ' + suits[card.suit]);
      }

      return result;
    },
    pluralCardRanks: function(card) {
      const names = ['none', 'aces', 'twos', 'threes', 'fours', 'fives', 'sixes', 'sevens', 'eights', 'nines', 'tens', 'jacks', 'queens', 'kings'];
      return names[card.rank];
    },
    mapPlayOption: function(option) {
      const optionMapping = {'resetbankroll': 'reset game',
                            'shuffle': 'shuffle',
                            'deal': 'deal',
                            'hit': 'hit',
                            'stand': 'stand',
                            'double': 'double down',
                            'insurance': 'take insurance',
                            'noinsurance': 'decline insurance',
                            'split': 'split',
                            'surrender': 'surrender'};
      return (optionMapping[option] ? optionMapping[option] : option);
    },
    mapOutcome: function(outcome) {
      const outcomeMapping = {'blackjack': 'You win with a Natural Blackjack! ',
                 'win': 'You won! ',
                 'loss': 'You lost. ',
                 'push': 'It\'s a push. ',
                 'surrender': 'You surrendered. '};
      return outcomeMapping[outcome];
    },
    mapMultipleOutcomes: function(outcome, numHands) {
      const twoHandMapping = {'win': 'You won both hands!',
                 'loss': 'You lost both hands.',
                 'push': 'Both hands pushed.',
                 'surrender': 'You surrendered both hands.'};
      const multipleHandMapping = {'win': 'You won all your hands!',
                 'loss': 'You lost all your hands.',
                 'push': 'You pushed on all your hands.',
                 'surrender': 'You surrendered all your hands.'};
      return (numHands == 2) ? twoHandMapping[outcome] : multipleHandMapping[outcome];
    },
    mapHandNumber: function(hand) {
      const mapping = ['First hand ', 'Second hand ', 'Third hand ', 'Fourth hand '];
      return mapping[hand];
    },
    mapDouble: function(rule) {
      const doubleMapping = {'any': 'on any cards',
                            'anyCards': 'on any number of cards',
                            '10or11': 'on 10 or 11 only',
                            '9or10or11': 'on 9 thru 11 only',
                            'none': 'not allowed'};
      return doubleMapping[rule];
    },
    mapBlackjackPayout: function(rule) {
      const blackjackPayout = {'0.5': '3 to 2',
                             '0.2': '6 to 5',
                             '0': 'even money'};
      return blackjackPayout[rule];
    },
    buildUnhandledResponse: function(intent, attributes) {
      const game = attributes[attributes.currentGame];
      let response = 'I can\'t ';

      // What are they trying to do?
      switch (intent.name) {
        case 'BlackjackIntent':
          // This one is a little more involved - need to get the ActionSlot
          if (intent.slots && intent.slots.Action && intent.slots.Action.value) {
            response += (intent.slots.Action.value + ' ');
          } else {
            // Really shouldn't happen
            console.log('Error - unhandled BlackjackIntent with no action in ' + state);
            response += 'do that ';
          }
          break;
        case 'SuggestIntent':
          response += 'give a suggestion ';
          break;
        case 'ChangeBetsIntent':
        case 'BetAmountIntent':
          response += 'change bets ';
          break;
        case 'ResetIntent':
          response += 'reset the game ';
          break;
        case 'AMAZON.YesIntent':
          response = 'Yes doesn\'t make sense ';
          break;
        case 'AMAZON.NoIntent':
          response = 'No doesn\'t make sense ';
          break;
        case 'DealIntent':
          response += 'deal a new game ';
          break;
        case 'RulesIntent':
          response += 'read the rules ';
          break;
        case 'HighScoreIntent':
          response += 'read the leader board ';
          break;
        case 'EnableTrainingIntent':
          response += 'turn on training mode ';
          break;
        case 'DisableTrainingIntent':
          response += 'turn off training mode ';
          break;
        case 'AddPlayerIntent':
          // This can only be done at the start of the game
          return 'To change the players at the table, you have to exit the skill. ';

        // These should be handled - so log an error
        case 'AMAZON.RepeatIntent':
        case 'AMAZON.HelpIntent':
        case 'AMAZON.StopIntent':
        case 'AMAZON.CancelIntent':
        case 'SessionEndedRequest':
        default:
          console.log('Error - unhandled ' + intent.name);
          response += 'do that ';
          break;
      }

      // New game - ready to start a new game
      if (attributes.temp.addingName) {
        response += 'while I\'m waiting for you to confirm a new player name';
      } else if (attributes.temp.firsthand) {
        response += 'while you are adding players to the table';
      } else if (attributes.temp.changingBets !== undefined) {
        response += 'while you are changing player bets';
      } else if (game && game.possibleActions && game.possibleActions.length) {
        if (game.possibleActions.indexOf('deal') >= 0) {
          response += 'before the hand has started';
        } else if (game.possibleActions.indexOf('noinsurance') >= 0) {
          response += 'while I\'m waiting to hear if you want insurance';
        } else {
          response += 'during the middle of a hand';
        }
      } else {
        response += 'at this time';
      }
      response += '. ';

      return response;
    },
  };
};

module.exports = utils;
