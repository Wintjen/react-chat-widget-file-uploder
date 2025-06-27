import React, { RefObject } from 'react';
import {useRef, useEffect, useState, forwardRef, useImperativeHandle, MouseEventHandler} from 'react';
import { useSelector } from 'react-redux';
import cn from 'classnames';

import { GlobalState } from 'src/store/types';

import { getCaretIndex, isFirefox, updateCaret, insertNodeAtCaret, getSelection } from '../../../../../../utils/contentEditable'
const send = require('../../../../../../../assets/send_button.svg') as string;
const emoji = require('../../../../../../../assets/icon-smiley.svg') as string;
const brRegex = /<br>/g;

import './style.scss';
import { FileUpload } from '../File-Upload';
import { TFile, useUploadFiles } from '../File-Upload/hooks';

import toast, { Toaster } from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';


type Props = {
  isShowEmoji: boolean;
  isShowFileUploader: boolean;
  placeholder: string;
  disabledInput: boolean;
  autofocus: boolean;
  sendMessage: (event: any) => void;
  buttonAlt: string;
  onPressEmoji: () => void;
  onChangeSize: (event: any) => void;
  onTextInputChange?: (event: any) => void;
  isNumeric?: boolean;
  screenRecording: boolean;
  setScreenRecording: (e: boolean) => void;
}

function Sender({
  sendMessage, placeholder, disabledInput, autofocus, onTextInputChange, buttonAlt,
  onPressEmoji, onChangeSize, isShowEmoji, isShowFileUploader, isNumeric, screenRecording, setScreenRecording,
}: Props, ref) {
  const showChat = useSelector((state: GlobalState) => state.behavior.showChat);
  const pasteEnabled = useSelector((state: GlobalState) => state.behavior.pasteEnabled);
  const minCharLimit = useSelector((state: GlobalState) => state.behavior.minCharLimit);
  const inputRef = useRef<HTMLDivElement>(null!);
  const refContainer = useRef<HTMLDivElement>(null);
  const [enter, setEnter]= useState(false)
  const [firefox, setFirefox] = useState(false);
  const [height, setHeight] = useState(0);
  const [disableSend, setDisableSend] = useState(false)
  const [files, setFiles] = useState<TFile[]>([])

  // @ts-ignore
  useEffect(() => { if (showChat && autofocus) inputRef.current?.focus(); }, [showChat]);
  useEffect(() => { setFirefox(isFirefox())}, [])

  useImperativeHandle(ref, () => {
    return {
      onSelectEmoji: handlerOnSelectEmoji,
    };
  });

  const handlerOnChange = (event) => {
    if (minCharLimit !== null && (inputRef.current.innerText && inputRef.current.innerText.length < minCharLimit)) {
      setDisableSend(true)
    } else {
      setDisableSend(false)
    }
    onTextInputChange && onTextInputChange(event)
  }


  const handlerSendMessage = () => {
    if (disableSend && files.length <= 0) {
      toast('Please tell us more')
      return
    }
    const el = inputRef.current;
    if(el.innerHTML || files.length > 0) {
      sendMessage(el.innerText + (files ? ' ' + files.map(f => `![](${f.source})`) : ''));
      el.innerHTML = ''
      setFiles([])
    }
  }

  const handlerOnSelectEmoji = (emoji) => {
    const el = inputRef.current;
    const { start, end } = getSelection(el)
    if(el.innerHTML) {
      const firstPart = el.innerHTML.substring(0, start);
      const secondPart = el.innerHTML.substring(end);
      el.innerHTML = (`${firstPart}${emoji.native}${secondPart}`)
    } else {
      el.innerHTML = emoji.native
    }
    updateCaret(el, start, emoji.native.length)
  }

  const handlerOnKeyPress = (event) => {
    const el = inputRef.current;
    
    if (isNumeric) {
      const charCode = event.which ? event.which : event.keyCode;
      const char = String.fromCharCode(charCode);
      const regex = /^\d*(\.\d*)?$/;
  
      if (!regex.test(char)) {
        event.preventDefault();
      }
    }

    if(event.charCode == 13 && !event.shiftKey) {
      event.preventDefault()
      handlerSendMessage();
    }
    if(event.charCode === 13 && event.shiftKey) {
      event.preventDefault()
      insertNodeAtCaret(el);
      setEnter(true)
    }
  }

  // TODO use a context for checkSize and toggle picker
  const checkSize = () => {
    const senderEl = refContainer.current
    if(senderEl && height !== senderEl.clientHeight) {
      const {clientHeight} = senderEl;
      setHeight(clientHeight)
      onChangeSize(clientHeight ? clientHeight -1 : 0)
    }
  }

  const handlerOnKeyUp = (event) => {
    const el = inputRef.current;
    if(!el) return true;
    // Conditions need for firefox
    if(firefox && event.key === 'Backspace') {
      if(el.innerHTML.length === 1 && enter) {
        el.innerHTML = '';
        setEnter(false);
      }
      else if(brRegex.test(el.innerHTML)){
        el.innerHTML = el.innerHTML.replace(brRegex, '');
      }
    }
    checkSize();
  }

  const handlerOnKeyDown= (event) => {
    const el = inputRef.current;
    
    if( event.key === 'Backspace' && el){
      const caretPosition = getCaretIndex(inputRef.current);
      const character = el.innerHTML.charAt(caretPosition - 1);
      if(character === "\n") {
        event.preventDefault();
        event.stopPropagation();
        el.innerHTML = (el.innerHTML.substring(0, caretPosition - 1) + el.innerHTML.substring(caretPosition))
        updateCaret(el, caretPosition, -1)
      }
    }
  }

  const handlerPressEmoji = () => {
    onPressEmoji();
    checkSize();
  }
  const handleFileInput = (fileInputRef: RefObject<HTMLInputElement>, files: { source: string }[] = []) => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setFiles(prevFiles => [...prevFiles, ...files])
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div ref={refContainer} className="rcw-sender">
      <Toaster />
      {isShowEmoji && (
        <button className='rcw-picker-btn' type="submit" onClick={handlerPressEmoji} data-tooltip-id="emoji-tooltip">
          <img src={emoji} className="rcw-picker-icon" alt="" />
          <Tooltip id="emoji-tooltip" content="Add an Emoji" place='top' style={{ zIndex: 9999 }} />
        </button>
      )}
      {isShowFileUploader && (
        <>
          <FileUpload 
          onClick={handleFileInput} 
          screenRecording={screenRecording} 
          setScreenRecording={setScreenRecording}
          files={files}
          setFiles={setFiles}
          />
        </>
        
      )}
      <div className={cn('rcw-new-message', {
          'rcw-message-disable': disabledInput,
        })
      }>

        <div
          spellCheck
          className="rcw-input"
          role="textbox"
          contentEditable={!disabledInput}
          ref={inputRef}
          onPaste={(e) => {
            if (!pasteEnabled) {
              e.preventDefault(); toast('Pasting is disabled')
            }
          }}
          placeholder={placeholder}
          onInput={handlerOnChange}
          onKeyPress={handlerOnKeyPress}
          onKeyUp={handlerOnKeyUp}
          onKeyDown={handlerOnKeyDown}
        />
        
        {files.length > 0 && (
          <div className="rcw-files-container">
            {files.map((file, index) => (
              <div key={index} className="rcw-file-item">
                {file.file?.type?.startsWith('video/') ? (
                  <video 
                    src={file.source} 
                    className="rcw-file-preview"
                    muted
                    preload="metadata"
                  />
                ) : (
                  <img src={file.source} alt={file.file?.name || 'Uploaded file'} className="rcw-file-preview" />
                )}
                <button 
                  className="rcw-file-remove"
                  onClick={() => removeFile(index)}
                  title="Remove file"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
      </div>
      <button type="submit" className="rcw-send" onClick={handlerSendMessage}>
        <img src={send} className="rcw-send-icon" alt={buttonAlt} />
      </button>
    </div>
  );
}

export default forwardRef(Sender);
