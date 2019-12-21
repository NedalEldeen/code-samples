import {
    runSaga
} from 'redux-saga';
import {
    select
} from 'redux-saga/effects';
import {
    worker_makeTheLoginProcess,
    worker_retrieveFBStatus,
    worker_openFBLoginDialog,
    worker_logUserInAfterFBConnect,
    worker_retrieveFBUser,
} from './UserSaga';
import {
    getFBStatus,
    openFBLoginDialog
} from '../services/fb/FBAPI';
import * as fbFakeDate from '../services/fb/__mocks__/FakeData';
//import * as UserAPI from '../services/user/UserAPI';
import * as selectors from '../selectors/UserSelectors';

jest.mock('../services/fb/FBAPI');
jest.mock('../services/user/UserAPI');




describe('UserSaga Workers', () => {

    let dispatched = [];

    beforeEach(() => {
        dispatched = [];
    });

    describe('worker_makeTheLoginProcess sequence', () => {
        let gen;
        beforeEach(() => {
            gen = worker_makeTheLoginProcess();
        });
        it('should work with logUserInAfterFBConnect after returing true from worker_retrieveFBStatus', () => {
            expect(gen.next().value).toEqual(worker_retrieveFBStatus());
            expect(gen.next().value).toEqual(select(selectors.selectIsUserConnected));
            expect(gen.next(true).value).toEqual(worker_logUserInAfterFBConnect());
            expect(gen.next().done).toBe(true);
        });
        it('should work with openFBLoginDialog then logUserInAfterFBConnect after returing false from worker_retrieveFBStatus', () => {
            expect(gen.next().value).toEqual(worker_retrieveFBStatus());
            expect(gen.next().value).toEqual(select(selectors.selectIsUserConnected));
            expect(gen.next(false).value).toEqual(worker_openFBLoginDialog());
            expect(gen.next().value).toEqual(worker_logUserInAfterFBConnect());
            expect(gen.next().done).toBe(true);
        });

    });

    describe('worker_retrieveFBStatus', () => {
        it('should dispatch actions of IS_CONNECTING, FB_STATUS_RETRIEVED in case of successfully connected', () => {
            let task = runSaga({
                dispatch: (action) => dispatched.push(action),
                getState: () => ({}),
            }, worker_retrieveFBStatus, {});
            return task.toPromise().then((res) => {
                expect(dispatched).toContainEqual({
                    type: 'IS_CONNECTING'
                });
                expect(dispatched).toContainEqual({
                    type: 'FB_STATUS_RETRIEVED',
                    payload: {
                        status: 'connected', // connected || not_authorized
                        authResponse: {
                            accessToken: '...',
                            expiresIn: '...',
                            signedRequest: '...',
                            userID: '...'
                        }
                    }
                });
            });
        });

        it('should dispatch actions of FB_CONNECT_ERROR in case of rejected promise', () => {
            getFBStatus.mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    reject({
                        error: 'error'
                    });
                });
            });
            let task = runSaga({
                dispatch: (action) => dispatched.push(action),
                getState: () => ({}),
            }, worker_retrieveFBStatus, {});
            return task.toPromise().then(() => {
                expect(dispatched).toContainEqual({
                    type: 'IS_CONNECTING'
                });
                expect(dispatched).toContainEqual({
                    type: 'FB_CONNECT_ERROR',
                    payload: {
                        error: 'error'
                    }
                });
            });
        });


    });

    describe('worker_openFBLoginDialog', () => {
        it('should dispatch actions of IS_CONNECTING, USER_CONNECTED in case of successfully connected', () => {
            let task = runSaga({
                dispatch: (action) => dispatched.push(action),
                getState: () => ({}),
            }, worker_openFBLoginDialog, {});
            return task.toPromise().then((res) => {
                expect(dispatched).toContainEqual({
                    type: 'IS_CONNECTING'
                });
                expect(dispatched).toContainEqual({
                    type: 'USER_CONNECTED',
                    payload: {
                        status: 'connected', // connected || not_authorized
                        authResponse: {
                            accessToken: '...',
                            expiresIn: '...',
                            signedRequest: '...',
                            userID: '...',
                            grantedScopes: 'public_profile,email,manage_pages,pages_show_list,pages_messaging'
                        }
                    }
                });
            });
        });


    });

    describe('worker_logUserInAfterFBConnect', () => {
        it('should dispatch actions of IS_LOGGING_IN, USER_LOGGED_IN in case of successfully connected', () => {
            selectors.selectIsUserConnected = jest.fn().mockImplementation(() => true);
            selectors.selectUserData = jest.fn().mockImplementation(() => ({
                user_fb_id: '....',
                access_token: '....'
            }));
            let task = runSaga({
                dispatch: (action) => dispatched.push(action),
                getState: () => ({}),
            }, worker_logUserInAfterFBConnect, {});
            return task.toPromise().then((res) => {
                expect(dispatched).toContainEqual({
                    type: 'IS_LOGGING_IN'
                });
                expect(dispatched).toContainEqual({
                    type: 'USER_LOGGED_IN',
                    payload: {
                        token: 'abcdef',
                        user_fb_id: '123456789'
                    }
                });
            });
        });


    });

    describe('worker_retrieveFBUser', () => {
        it('should dispatch actions of FB_USER_DATA_RETRIEVED in case of successfully connected', () => {
            let task = runSaga({
                dispatch: (action) => dispatched.push(action),
                getState: () => ({}),
            }, worker_retrieveFBUser, {});
            return task.toPromise().then((res) => {
                expect(dispatched).toContainEqual({
                    type: 'FB_USER_DATA_RETRIEVED',
                    payload: fbFakeDate.fbUserData
                });
                // expect(dispatched.length).toBe(1);
                // expect(dispatched[0]).toEqual({
                //     type: 'FB_USER_DATA_RETRIEVED',
                //     payload: expect.objectContaining({
                //         id: '123456789',
                //         name: 'test_name',
                //         permissions: {
                //             data: expect.arrayContaining([
                //                 {
                //                   "permission": "email",
                //                   "status": "granted"
                //                 }
                //             ])
                //         }
                //     })
                // });
            });
        });
    });

});
