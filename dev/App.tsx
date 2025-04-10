import React from 'react';
import { Component } from 'react';
import { Widget as WidgetType, addResponseMessage, setQuickButtons, toggleMsgLoader, addLinkSnippet, toggleInputDisabled, toggleForcedScreenRecorder, toggleWidget, togglePasteEnabled } from '../index';
import { addUserMessage } from '../index';

const Widget = WidgetType as any;

export default class App extends Component {
  componentDidMount() {
    toggleWidget();
    addResponseMessage('Thanks for stopping by!. We have just three questions for you today. These questions will ask you to record your screen while you click around that site and talk about your experience as you go (so you will need to record your screen and allow audio recording as well). To begin, please open another tab or window and visit [CLICK HERE](http://facebook.com) \n\n For the first one of these, please show me your favorite part of the website! Navigate to whichever element you liked the most and record yourself interacting with or using it, and tell me what about it you liked so much. In your voiceover, discuss what about this set it apart from the other elements of the website for you and made it your favorite. ');
    addLinkSnippet({ link: 'https://google.com', linkMask: "mask the link with text", title: 'Google' });
    setQuickButtons([ { label: 'Apple', value: 'apple' }, { label: 'Orange', value: 'orange' }, { label: 'Pear', value: 'pear' }, { label: 'Banana', value: 'banana' } ]);
    addResponseMessage('![](https://raw.githubusercontent.com/Wolox/press-kit/master/logos/logo_banner.png)');
    addResponseMessage('![vertical](https://d2sofvawe08yqg.cloudfront.net/reintroducing-react/hero2x?1556470143)');
    // toggleInputDisabled(true)
    togglePasteEnabled(false)
    toggleForcedScreenRecorder(true)
    setTimeout(() => {
      toggleInputDisabled(false)
      toggleForcedScreenRecorder(false)
    }, 3000)
  }

  handleNewUserMessage = (newMessage: any) => {
    // setQuickButtons([ { label: 'Apple', value: 'apple' }, { label: 'Orange', value: 'orange' }, { label: 'Pear', value: 'pear' }, { label: 'Banana', value: 'banana' } ]);
    // toggleInputDisabled();
    toggleMsgLoader();
    togglePasteEnabled(true)
    setTimeout(() => {
      toggleMsgLoader();
      if (newMessage === 'fruits') {
        setQuickButtons([ { label: 'Apple', value: 'apple' }, { label: 'Orange', value: 'orange' }, { label: 'Pear', value: 'pear' }, { label: 'Banana', value: 'banana' } ]);
      } else {
        addResponseMessage(newMessage);
      }
    }, 2000);
  }

  handleQuickButtonClicked = (e: any) => {
    addResponseMessage('Selected ' + e);
    setQuickButtons([]);
  }

  handleSubmit = (msgText: string) => {
    if(msgText.length < 80) {
      addUserMessage("Uh oh, please write a bit more.");
      return false;
    }
    return true;
  }

  sendImageFile = async (p: any) => {
    console.log('image')
  }

  render() {
    return (
      <Widget
        quickButtonsInMessage={true}
        isShowEmoji={true}
        emojis
        fullScreenMode={true}
        showCloseButton={false}
        title="Bienvenido"
        subtitle="Asistente virtual"
        senderPlaceHolder="Escribe aquí ..."
        handleNewUserMessage={this.handleNewUserMessage}
        handleQuickButtonClicked={this.handleQuickButtonClicked}
        handleSubmit={this.handleSubmit}
        // emojis
        isNumeric={false}
        sendImageFile={this.sendImageFile}
      />
    );
  }
}
