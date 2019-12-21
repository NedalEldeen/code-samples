import React from 'react';
import ActionTypes from '../../../state/actions/ActionTypes';
import { NavLink, withRouter  } from "react-router-dom";
import CONFIG from '../../../config.js'
import './sidebar.scss';

export class Sidebar extends React.Component{
    constructor(props){
        super(props)
    }

    componentDidMount(){
        this.props.dispatch({
            type: ActionTypes.SAGA_RETRIVE_FB_PAGES
        });
    }

    installBot(pageId){
        this.props.dispatch({
            type: ActionTypes.SAGA_INSTALL_BOT,
            payload: {
                page_id: pageId
            }
        });
    }

    renderBots(){
        //let { path, url } = useRouteMatch();
        if(this.props.bots){
            if(this.props.bots.bots.length > 0){
                let bots = this.props.bots.bots;
                return bots.map((bot, index) => {
                    return (
                        <li  key={bot.getId()}>
                            <NavLink
                            to={`/bot/${bot.getId()}`}
                            onClick={(event) => {
                                this.props.dispatch({
                                    type: ActionTypes.SELECT_BOT,
                                    payload: {
                                        bot_id: bot.getId()
                                    }
                                });
                            }}
                            isActive={(match, location) => {
                                // in case of first bot in sidebar
                                if(index === 0){
                                    // make it active in case of not selected one
                                    if(!this.props.match.params['botId']){
                                        return true;
                                    }
                                }
                                // for each one return true (isActive) if matched
                                if(!!match)
                                    return true;
                            }}
                            >
                                <div className="page-item">
                                    <img src={`${CONFIG.CDN_URL}/${bot.getId()}.jpg`} data-test="page-icon" />
                                    <div className="page-row">
                                        <b data-test="page-name">{bot.getName()}</b>
                                    </div>
                                    <div className="clear"></div>
                                </div>
                            </NavLink >
                        </li>
                    );
                });
            }
        }
        return null;
    }

    renderFBPages(){
        let installedBotsId = this.props.bots.bots.map((b) => b.getId());
        if(this.props.fb_pages){
            if(this.props.fb_pages.pages.length > 0){
                let pages = this.props.fb_pages.pages;
                return pages.map((page) => {
                    if(installedBotsId.indexOf(page.id) !== -1){
                        return null;
                    }
                    return (
                        <li className="page-item" key={page.id}>
                            <img src={page.icon_url} data-test="page-icon" />
                            <div className="page-row">
                                <a href={`https://facebook.com/${page.id}`} data-test="page-anchor" >
                                    <b data-test="page-name">{page.name}</b>
                                </a>
                                <br />
                                <a onClick={(event) => {
                                    this.installBot(page.id);
                                    event.preventDefault();
                                }} href="javascript:;">Install Bot</a>
                            </div>
                            <div className="clear"></div>
                        </li>
                    );
                });
            }
        }
        return null;
    }

    render(){
        return(
            <div id="sidebar">
                <div className="bots-container">
                    <h3 className="head">Installed Bots</h3>
                    <ul className="pages-list">{this.renderBots()}</ul>
                </div>
                <div className="fb-pages-container">
                    <h3 className="head">Facebook Pages</h3>
                    <ul className="pages-list">{this.renderFBPages()}</ul>
                </div>
            </div>
        );
    }
}

export default withRouter(Sidebar);
