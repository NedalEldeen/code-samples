import ActionTypes from '../../actions/ActionTypes';
import * as ReducerHandlers from './ReducerHandlers';
import BotMessagesReducer from './messages/BotMessagesReducer';
import BotBtnsReducer from './btns/BotBtnsReducer';
import BotActionsReducer from './actions/BotActionsReducer';
const initialState = {
    bots: [],
    bots_are_retrieved: false,
    selected_bot: false,
    selected_bot_id: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.BOTS_RETRIEVED: {
            return ReducerHandlers.onBotsRetrieved(state, action);
            break;
        }
        case ActionTypes.BOT_INSTALLED: {
            return ReducerHandlers.onBotInstalled(state, action);
            break;
        }
        case ActionTypes.SELECT_BOT: {
            return ReducerHandlers.onSelectBot(state, action);
            break;
        }
        case ActionTypes.BOT_MESSAGES_MODIFIED: {
            return BotMessagesReducer(state, action);
            break;
        }
        case ActionTypes.BOT_BTNS_MODIFIED: {
            return BotBtnsReducer(state, action);
            break;
        }
        case ActionTypes.BOT_ACTIONS_MODIFIED: {
            return BotActionsReducer(state, action);
            break;
        }
        default:
            return state;
    }
};
