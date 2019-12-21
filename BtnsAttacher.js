import React, {useState} from 'react';
import AttachedBtn from '../../../../classes/Btn/AttachedBtn';
import BtnComponent from '../btns/btn/BtnComponent';
import './BtnsAttacher.scss';

export default function BtnsAttacher(props){
    let {dialog, bot, pre_attachedBtns, onAttachedBtnsChanged, for_url_msg} = props;
    // attachedBtn types (predefined | webview | ...)
    let [attachedBtnsType, setAttachedBtnsType] = useState(1);
    // selected attachedBtns
    let [attachedBtns, setAttachedBtns] = useState(pre_attachedBtns || []);
    // name of attached webview btn
    let [attachedBtnName, setAttachedBtnName] = useState('');
    // url of attached webview btn
    let [attachedBtnUrl, setAttachedBtnUrl] = useState('');

    // pass selected attached btns to outer form when dialo is done
    dialog.on('done', () => {
        onAttachedBtnsChanged(attachedBtns);
    });

    /*
    * handler for selecting (attachedBtn type)
    */
    function onAttachBtnsTypeChanged(event) {
        let type = parseInt(event.target.value);
        setAttachedBtnsType(type);
    }
    /*
    * handler for deleting (selected attachedBtn)
    */
    function onDeleteAttachedBtn(btn, event) {
        attachedBtns.splice(attachedBtns.indexOf(btn), 1);
        setAttachedBtns([...attachedBtns]);
    }
    /*
    *
    */
    function renderPredefinedBtnsSelection() {
        if(bot.getBtns().length > 0){
            return bot.getBtns().filter((btn) => ( (attachedBtns.indexOf(btn) === -1)? true: false )).map((btn) => {
                return (
                    <div key={btn.getId()}>
                        <BtnComponent
                            btn={btn}
                            key={btn.getId()}
                            embeded={{allow_delete: false}}
                        />
                        <a onClick={(e)=>{
                            let attachedBtn = new AttachedBtn();
                            attachedBtn.parseAttachedBtn({
                                type: AttachedBtn.ATTACHED_PREDEFINED_BTN_TYPE,
                                btn_id: btn.getId(),
                                predefined_btn: btn
                            });
                            setAttachedBtns([...attachedBtns, attachedBtn]);
                            //onAttachedBtnsChanged(attachedBtns);
                            e.preventDefault();
                        }} href="javascript:;">Select</a>
                    </div>
                );
            });
        }
        return('not pre-defined btns');
    }

    function renderWebviewBtnsSelection(){
        return(
            <div>
                <div>
                    <label>Button Name</label>
                    <input value={attachedBtnName} onChange={(event) => setAttachedBtnName(event.target.value)} />
                </div>
                <div>
                    <label>Button URL</label>
                    <input value={attachedBtnUrl} onChange={(event) => setAttachedBtnUrl(event.target.value)} />
                </div>
                <div>
                    <a onClick={(event)=>{
                        event.preventDefault();
                        if(attachedBtnName && attachedBtnUrl){
                            let attachedBtn = new AttachedBtn();
                            attachedBtn.parseAttachedBtn({
                                type: AttachedBtn.ATTACHED_WEBVIEW_BTN_TYPE,
                                name: attachedBtnName,
                                url: attachedBtnUrl
                            });
                            setAttachedBtns([...attachedBtns, attachedBtn]);
                            setAttachedBtnName('');
                            setAttachedBtnUrl('');
                        }

                    }} href="javascript:;">Attach</a>
                </div>
            </div>
        );
    }

    function renderSelectedAttachedBtns(){
        if(attachedBtns.length > 0){
            return attachedBtns.map((btn, index) => {
                return (
                    <BtnComponent
                        attachedBtn={btn}
                        key={`attached_btn_${index}`}
                        embeded={{
                            on_delete_btn: onDeleteAttachedBtn,
                            allow_delete: true
                        }}
                    />
                );
            });
        }
        return('attach btn');
    }

    return(
        <div id="btns-attacher">
            <div className="selection">
                <div>
                    <label>Select Button Type</label>
                    <select value={attachedBtnsType} onChange={onAttachBtnsTypeChanged}>
                        <option value={AttachedBtn.ATTACHED_PREDEFINED_BTN_TYPE}>Predefined Button</option>
                        <option value={AttachedBtn.ATTACHED_WEBVIEW_BTN_TYPE}>Webview Button</option>
                        <option value={AttachedBtn.ATTACHED_FACEBOOK_SHARE_BTN_TYPE} disabled={(!for_url_msg)? 'disabled': ''} >Share On FB Wall Button</option>
                        <option disabled value={AttachedBtn.ATTACHED_MESSENGER_SHARE_BTN_TYPE}>Native Messenger Button (deprecated)</option>
                    </select>
                </div>
                {(attachedBtnsType === AttachedBtn.ATTACHED_PREDEFINED_BTN_TYPE) &&
                    renderPredefinedBtnsSelection()
                }
                {(attachedBtnsType === AttachedBtn.ATTACHED_WEBVIEW_BTN_TYPE) &&
                    renderWebviewBtnsSelection()
                }
            </div>
            <div className="result">
                {renderSelectedAttachedBtns()}
            </div>
        </div>
    );
}
