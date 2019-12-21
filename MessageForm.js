import React, {useState} from 'react';
import Form from 'react-bootstrap/Form';
import TagsSelector from 'react-tag-autocomplete';
import MessageValidator from '../../../../../classes/Message/MessageValidator';
import ActionTypes from '../../../../../state/actions/ActionTypes';
import Store from '../../../../../state/Store';
import './MessageForm.scss';
import BtnsAttacher from '../../BtnsAttacher/BtnsAttacher';
import BtnComponent from '../../btns/btn/BtnComponent';

import {getLastDMInstance} from 'react-dialog-manager';
const dm = getLastDMInstance();

export default function MessageForm(props){
    let {bot} = props;
    // message type
    let [msgType, setMsgType] = useState(1);
    // text message
    let [msgText, setMsgText] = useState('');
    // url data of url_message
    let [urlData, setUrlData] = useState({url: '', title: '', subtitle: '', image_url: ''});
    // attached btns
    let [attachedBtns, setAttachedBtns] = useState([]);
    // attached btns
    let [tags, setTags] = useState([]);

    function getMsgData(){
        return {
            type: msgType,
            text_data: {
                text: msgText
            },
            url_data: urlData,
            media_data: {

            },
            btns: attachedBtns.map((btn) => {
                if(btn.getType() === MessageValidator.ATTACHED_PREDEFINED_BTN_TYPE){
                    return {
                        type: btn.getType(),
                        btn_id: btn.getId()
                    }
                }
                if(btn.getType() === MessageValidator.ATTACHED_WEBVIEW_BTN_TYPE){
                    return {
                        type: btn.getType(),
                        name: btn.getName(),
                        url: btn.getUrl(),
                    }
                }
            }),
            tags: tags
        };
    }
    /*
    *
    */
    function submitForm(event){
        event.preventDefault();
        let validator = new MessageValidator();
        let validatedMsg;
        if(!(validatedMsg = validator.validateMessage(getMsgData()))){
            console.log('set msg');
        }else{
            console.log(validatedMsg);
            Store.dispatch({
                type: ActionTypes.SAGA_MODIFY_BOT_MESSAGES,
                sub_type: ActionTypes.SUB_TYPES.ADD_MESSAGE,
                payload: validatedMsg
            });
        }

    }
    /*
    *
    */
    function onMsgTypeChanged(event){
        const { name, value } = event.target;
        setMsgType(parseInt(value));
    }
    /*
    *
    */
    function onAttachedBtnsChanged(attachedBtns) {
        setAttachedBtns([...attachedBtns]);
    }
    /*
    *
    */
    function onAttachBtnClicked(event) {
        let d = dm.createDialog({
            title: 'Attach Button To Message',
            body: <BtnsAttacher
                    bot={bot}
                    pre_attachedBtns={attachedBtns}
                    onAttachedBtnsChanged={onAttachedBtnsChanged}
                    for_url_msg={(msgType === MessageValidator.URL_MESSAGE_TYPE)? true: false}
                    />
        }).open();
        event.preventDefault();
    }
    //onAttachBtnClicked({preventDefault: () => true});
    /*
    *
    */
    function renderMsgTypeInputs(){
        let inputs = null;
        if(msgType === MessageValidator.TEXT_MESSAGE_TYPE){
            inputs = (
                <div>
                    <Form.Group>
                        <Form.Label>Message Text</Form.Label>
                        <Form.Control value={msgText} onChange={(e)=>setMsgText(e.target.value)} as="textarea" placeholder="Message Text..." />
                    </Form.Group>
                </div>
            );
        }
        if(msgType === MessageValidator.URL_MESSAGE_TYPE){
            inputs = (
                <div>
                    <Form.Group>
                        <Form.Label>URL</Form.Label>
                        <Form.Control value={urlData['url']} onChange={(e)=>setUrlData({...urlData, url: e.target.value})} placeholder="URL..." />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Title</Form.Label>
                        <Form.Control value={urlData['title']} onChange={(e)=>setUrlData({...urlData, title: e.target.value})} placeholder="Title..." />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Subtitle</Form.Label>
                        <Form.Control value={urlData['subtitle']} onChange={(e)=>setUrlData({...urlData, subtitle: e.target.value})} placeholder="Subtitle..." />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Image URL (Thumbnail)</Form.Label>
                        <Form.Control value={urlData['image_url']} onChange={(e)=>setUrlData({...urlData, image_url: e.target.value})} placeholder="Image URL (Thumbnail)..." />
                    </Form.Group>
                </div>
            );
        }
        if(msgType === MessageValidator.MEDIA_MESSAGE_TYPE){
            inputs = (
                <div>
                    This part of app is under construction
                </div>
            );
        }
        return inputs;
    }
    /*
    *
    */
    function renderBtnsAttachment(){
        return (
            <div className="btns-attachment">
                <div className="attached-btns">
                    {attachedBtns.length > 0 &&
                        attachedBtns.map((btn, index) => {
                            return(
                                <BtnComponent
                                    attachedBtn={btn}
                                    key={`attached_btn_${index}`}
                                    embeded={{allow_delete: false}}
                                />
                            );
                        })
                    }
                </div>
                <div className="right-content">
                    <a onClick={onAttachBtnClicked} href="javascript:;">Modify Attached Btns</a>
                </div>
            </div>
        );
    }

    return (
        <Form className="message-form">
            <Form.Group>
                <Form.Label className="bold">Message Type</Form.Label>
                <div key="inline-radio" className="mb-3">
                    <Form.Check label="Text Message" value={MessageValidator.TEXT_MESSAGE_TYPE} onChange={onMsgTypeChanged} checked={msgType == MessageValidator.TEXT_MESSAGE_TYPE} type="radio" inline id={`message_type_${MessageValidator.TEXT_MESSAGE_TYPE}`} name="msg-type" />
                    <Form.Check label="URL Message" value={MessageValidator.URL_MESSAGE_TYPE} onChange={onMsgTypeChanged} checked={msgType == MessageValidator.URL_MESSAGE_TYPE} type="radio" inline id={`message_type_${MessageValidator.URL_MESSAGE_TYPE}`} name="msg-type" />
                    <Form.Check label="Media Message" value={MessageValidator.MEDIA_MESSAGE_TYPE} onChange={onMsgTypeChanged} checked={msgType == MessageValidator.MEDIA_MESSAGE_TYPE} type="radio" inline id={`message_type_${MessageValidator.MEDIA_MESSAGE_TYPE}`} name="msg-type" />
                </div>
            </Form.Group>

            <div className="msg-inputs-con">
                {renderMsgTypeInputs()}
                <Form.Group>{renderBtnsAttachment()}</Form.Group>
                <Form.Group>
                    <TagsSelector
                        allowNew={true}
                        tags={tags.map((tag, index) => ({id:`tag_${index}`, name: tag}))}
                        suggestions={bot.getTags().map((tag, index) => ({id:`tag_${index}`, name: tag}))}
                        handleDelete={(itemIndex) => {
                            tags.splice(itemIndex, 1);
                            setTags([...tags]);
                        }}
                        handleAddition={(item) => {
                            setTags([...tags, item.name]);
                        }}
                        delimiters={[188, 13]}
                        />
                </Form.Group>
            </div>

            <button onClick={submitForm}>Ok</button>
        </Form>
    );
}
