import CONFIG from '../../../config';
import Cookie from 'js-cookie';
/*
*
*/
export function onConnecting(state = {}, action){
    return {
        ...state,
        is_connecting: true,
    }
}
/***/
export function onConnectingError(state = {}, action) {
    let errors = [];
    let payload = action.payload;
    if(!!payload.message){
        errors.push(payload.message);
    }
    if(!!payload.errors){
        errors = payload.errors;
    }
    return Object.assign({}, state, {
        access_errors: errors,
        is_connecting: false,
        is_logging_in: false
    });
}
/*
*
*/
export function onFBStatusRetrieved(state = {}, action){
    let payload = action.payload;
    if(payload.status == 'connected'){
        let authRes = payload.authResponse;
        return {
            ...state,
            is_connecting: false,
            connected: true,
            user_fb_id: authRes.userID,
            access_token: authRes.accessToken
        }
        // let authRes = payload.authResponse;
        // if(!authRes.grantedScopes){
        //     return {
        //         ...state,
        //         is_connecting: false,
        //         connected: false,
        //         access_errors: ['you should give us all required permissions']
        //     };
        // }else{
        //     let scopesArray = authRes.grantedScopes.split(',');
        //     let allScopesGranted = CONFIG.FACEBOOK.SCOPE.split(',').every((item)=>{
        //         return (scopesArray.indexOf(item) > -1);
        //     });
        //     if(!allScopesGranted){
        //         return {
        //             ...state,
        //             is_connecting: false,
        //             connected: false,
        //             access_errors: ['you should give us all required permissions']
        //         };
        //     }else{
        //
        //     }
        // }

    }
    return {
        ...state,
        is_connecting: false,
        connected: false
    };
}
/*
*
*/
export function onUserConnected(state = {}, action){
    let payload = action.payload;
    if(payload.status == 'connected'){
        let authRes = payload.authResponse;
        if(!authRes.grantedScopes){
            return {
                ...state,
                is_connecting: false,
                connected: false,
                access_errors: ['you should give us all required permissions']
            };
        }else{
            let scopesArray = authRes.grantedScopes.split(',');
            let allScopesGranted = CONFIG.FACEBOOK.SCOPE.split(',').every((item)=>{
                return (scopesArray.indexOf(item) > -1);
            });
            if(!allScopesGranted){
                return {
                    ...state,
                    is_connecting: false,
                    connected: false,
                    access_errors: ['you should give us all required permissions']
                };
            }else{
                return {
                    ...state,
                    is_connecting: false,
                    connected: true,
                    user_fb_id: authRes.userID,
                    access_token: authRes.accessToken
                }
            }
        }

    }
    return {
        ...state,
        is_connecting: false,
        connected: false
    };
}
/*
*
*/
export function onLoggingIn(state = {}, action){
    return {
        ...state,
        is_logging_in: true,
    }
}
/*
*
*/
export function onUserLoggedIn(state = {}, action){
    let payload = action.payload;
    if(!!payload.user_fb_id && !!payload.token){
        Cookie.set(CONFIG.COOKIE.id_key, payload.user_fb_id, {
            expires: 30
        });
        Cookie.set(CONFIG.COOKIE.token_key, payload.token, {
            expires: 30
        });
        return {
            ...state,
            logged_in: true,
            is_logging_in: false
        }
    }
    return state;
}
/*
*
*/
export function onRetrievingLoggedInStatus(state = {}, action){
    if(Cookie.get('__fbbot_fb_id') && Cookie.get('__fbbot_t')){
        return {
            ...state,
            logged_in: true,
        }
    }else {
        return {
            ...state,
            logged_in: false,
        }
    }
}
/*
*
*/
export function onRetrievingFBUserData(state = {}, action){
    let payload = action.payload;
    if(!payload.permissions){
        return{
            ...state,
            connected: false,
            access_errors: ['you should give us all required permissions']
        }
    }else{
        let permissions = payload.permissions.data.map(obj => obj.permission);
        let allGrantedPermissions = CONFIG.FACEBOOK.SCOPE.split(',').every((item)=>{
            return (permissions.indexOf(item) > -1);
        });
        if(!allGrantedPermissions){
            return {
                ...state,
                is_connecting: false,
                connected: false,
                access_errors: ['you should give us all required permissions']
            };
        }else{
            return {
                ...state,
                fb_user: {
                    user_fb_id: payload.id,
                    name: payload.name,
                    permissions: permissions
                }
            }
        }
    }

}
