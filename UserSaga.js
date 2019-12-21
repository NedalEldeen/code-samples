import {
    takeLatest,
    call,
    put,
    select
} from 'redux-saga/effects';
import ActionTypes from '../actions/ActionTypes';
import {
    getFBStatus,
    openFBLoginDialog,
    retrieveFBUser,
} from '../services/fb/FBAPI';
import {
    logUserIn
} from '../services/user/UserAPI';
import {
    selectIsUserConnected,
    selectUserData
} from '../selectors/UserSelectors';


/*
 * this worker is responsible for retrieveing facebook status of user
 * it should dispatch action which is telling "IS_CONNECTING"
 * it'll call getFBStatus service and dispatch action with response in case of success
 * otherwise, it'll dispatch action with catched error
 */
export function* worker_retrieveFBStatus() {
    yield put({
        type: ActionTypes.IS_CONNECTING
    });
    try {
        const response = yield call(getFBStatus);
        yield put({
            type: ActionTypes.FB_STATUS_RETRIEVED,
            payload: response
        });
    } catch (error) {
        yield put({
            type: ActionTypes.FB_CONNECT_ERROR,
            payload: error
        });
    }
}
/*
 * this worker is responsible for handling Async og fb login dialog
 * it should dispatch action which is telling "IS_CONNECTING"
 * it'll call openFBLoginDialog service and dispatch action with response in case of success
 * otherwise, it'll dispatch action with catched error
 */
export function* worker_openFBLoginDialog() {
    yield put({
        type: ActionTypes.IS_CONNECTING
    });
    try {
        const response = yield call(openFBLoginDialog);
        yield put({
            type: ActionTypes.USER_CONNECTED,
            payload: response
        });
    } catch (error) {
        console.log(error);
        yield put({
            type: ActionTypes.FB_CONNECT_ERROR,
            payload: error
        });
    }
}
/*
 *
 */
export function* worker_logUserInAfterFBConnect() {
    let connected = yield select(selectIsUserConnected);
    if (connected) {
        yield put({
            type: ActionTypes.IS_LOGGING_IN
        });
        const userData = yield select(selectUserData);
        try {
            const response = yield call(logUserIn, {
                user_fb_id: userData.user_fb_id,
                access_token: userData.access_token
            });
            yield put({
                type: ActionTypes.USER_LOGGED_IN,
                payload: response.data
            });
        } catch (e) {

        }
    }else{
        console.log('connected');
    }
}
/*
 *
 */
export function* worker_makeTheLoginProcess(action) {
    yield worker_retrieveFBStatus();
    let connected = yield select(selectIsUserConnected);
    if (connected) {
        yield worker_logUserInAfterFBConnect();
    } else {
        yield worker_openFBLoginDialog();
        yield worker_logUserInAfterFBConnect();
    }
}
/*
*
*/
export function* worker_retrieveFBUser() {
    try {
        const response = yield call(retrieveFBUser);
        yield put({
            type: ActionTypes.FB_USER_DATA_RETRIEVED,
            payload: response
        });
    } catch (error) {
        yield put({
            type: ActionTypes.FB_CONNECT_ERROR,
            payload: error
        });
    }
}

function* userSagaSwitch(action) {
    if (action.type == ActionTypes.SAGA_RETRIVE_FB_STATUS) {
        yield worker_retrieveFBStatus(action);
    } else if (action.type == ActionTypes.SAGA_MAKE_LOGIN_PROCESS) {
        yield worker_makeTheLoginProcess(action);
    } else if (action.type == ActionTypes.SAGA_RETRIVE_FB_USER) {
        yield worker_retrieveFBUser(action);
    }
    return;
}

function* userSagas() {
    yield takeLatest(
        [
            ActionTypes.SAGA_MAKE_LOGIN_PROCESS,
            ActionTypes.SAGA_RETRIVE_FB_STATUS,
            ActionTypes.SAGA_RETRIVE_FB_USER,
        ],
        userSagaSwitch);
}

export default userSagas;
