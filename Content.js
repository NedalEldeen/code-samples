import React from 'react';
import {
    connect
} from 'react-redux';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
    NavLink,
    withRouter
} from "react-router-dom";
import {Alert} from 'react-bootstrap';
import ActionTypes from '../../../state/actions/ActionTypes';
import MessagesContainer from './messages/MessagesContainer'
import BtnsContainer from './btns/BtnsContainer'
import ActionsContainer from './actions/ActionsContainer'
import './content.scss';


export class Content extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

        let urlParams = this.props.match.params;
        if (!!urlParams['botId']) {
            this.props.dispatch({
                type: ActionTypes.SELECT_BOT,
                payload: {
                    bot_id: urlParams['botId']
                }
            });
        }

        // this.props.dispatch({
        //     type: ActionTypes.SAGA_RETRIVE_FB_USER
        // });
        // this.props.dispatch({
        //     type: ActionTypes.SAGA_RETRIVE_BOTS
        // });

    }

    componentDidUpdate(prevProps) {
        // console.log('this', this, prevProps);
        // let selectedBot = this.props.bots.selected_bot;
        // if(!!selectedBot){
        //     let urlParams = this.props.match.params;
        //     if(urlParams['botId'] !== selectedBot.getId()){
        //         this.props.history.push('/bot/'+selectedBot.getId());
        //     }
        // }
    }

    renderRouting() {
        let routerMatch = this.props.match;
        /*
        * importent note)->
        * -----------------
        * this router is usually a nested one, but sometimes, maybe not
        * so, in case of not nested router,
        * we should split out the slash "/" from routerMatch.url and routerMatch.path
        * if we didn't make that, the router would replace/push with double slashes "//",
        * which means replace/push into new domain name
        */
        if(routerMatch.url === '/'){
            routerMatch.url = '';
        }
        if(routerMatch.path === '/'){
            routerMatch.path = '';
        }

        return(
            <div>
                <div className="tabs">
                    <NavLink to={`${routerMatch.url}/messages`}>
                        <div className="tab">Messages</div>
                    </NavLink>
                    <NavLink to={`${routerMatch.url}/buttons`}>
                        <div className="tab">Button</div>
                    </NavLink>
                    <NavLink to={`${routerMatch.url}/actions`}>
                        <div className="tab">Actions</div>
                    </NavLink>
                    <NavLink to={`${routerMatch.url}/assets`}>
                        <div className="tab">Assets</div>
                    </NavLink>
                </div>

                <div className="tabs-content">
                    <Switch>
                        <Route path={`${routerMatch.path}/assets`}>
                            <div className="tab-content">
                                <p>This part of the app is under construction</p>
                            </div>
                        </Route>
                        <Route path={`${routerMatch.path}/actions`}>
                            <div className="tab-content">
                                <ActionsContainer bot={this.props.bots.selected_bot} />
                            </div>
                        </Route>
                        <Route path={`${routerMatch.path}/buttons`}>
                            <div className="tab-content">
                                <BtnsContainer bot={this.props.bots.selected_bot} />
                            </div>
                        </Route>
                        <Route path={`${routerMatch.path}/messages`}>
                            <div className="tab-content">
                                <MessagesContainer bot={this.props.bots.selected_bot} />
                            </div>
                        </Route>
                        <Redirect from={`${routerMatch.path}`} to={`${routerMatch.url}/messages`} />
                    </Switch>
                </div>
            </div>
        );
    }

    render() {

        let selectedBot = this.props.bots.selected_bot;
        if (!!selectedBot) {

            return (
                <div id = "content" >
                    <Alert variant="warning">
                        This is the new version of fb-bot.me app. So, many features have not been developed yet.
                        <br />
                        <a href="https://old.fb-bot.me/">
                            Check out the old version
                        </a>
                    </Alert>
                    <div className="bot-head">
                        <h4 className="bot-title">{selectedBot.getName()}</h4>
                        <div className="bot-profile"></div>
                    </div>
                    <div className="bot-body">
                        {this.renderRouting()}
                    </div>
                </div>
            );
        } else {
            return (
                <div id = "content">
                Select Bot From Sidebar
                </div>
            );
        }

    }

}

// export default connect(
//     (state, ownProps) => {
//         return {
//             bots: state.bots
//         }
//     }
// )(Content);

export default withRouter(connect(
    (state, ownProps) => {
        return {
            bots: state.bots
        }
    }
)(Content));
