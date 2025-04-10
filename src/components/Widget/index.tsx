import React from 'react';
import { useDispatch } from 'react-redux';

import { toggleChat, addUserMessage } from '../../store/actions';
import { isWidgetOpened, renderCustomComponent } from '../../store/dispatcher';
import { AnyFunction } from '../../utils/types';
import { TFile } from './components/Conversation/components/File-Upload/hooks';

import WidgetLayout from './layout';

type Props = {
  title: string;
  titleAvatar?: string;
  subtitle: string;
  senderPlaceHolder: string;
  profileAvatar?: string;
  profileClientAvatar?: string;
  showCloseButton: boolean;
  fullScreenMode: boolean;
  autofocus: boolean;
  customLauncher?: AnyFunction;
  handleNewUserMessage: AnyFunction;
  handleQuickButtonClicked?: AnyFunction;
  handleTextInputChange?: (event: any) => void;
  chatId: string;
  handleToggle?: AnyFunction;
  launcherOpenLabel: string;
  launcherCloseLabel: string;
  launcherOpenImg: string;
  launcherCloseImg: string;
  sendButtonAlt: string;
  showTimeStamp: boolean;
  imagePreview?: boolean;
  zoomStep?: number;
  handleSubmit?: AnyFunction;
  showBadge?: boolean;
  resizable?: boolean;
  emojis?: boolean;
  isShowEmoji?: boolean;
  isShowFileUploader?: boolean;
  quickButtonsInMessage?: boolean;
  isNumeric?: boolean;
  // setImageFile: React.Dispatch<React.SetStateAction<TFile[]>>;
}

function Widget({
  title,
  titleAvatar,
  subtitle,
  senderPlaceHolder,
  profileAvatar,
  profileClientAvatar,
  showCloseButton,
  fullScreenMode,
  autofocus,
  customLauncher,
  handleNewUserMessage,
  handleQuickButtonClicked,
  handleTextInputChange,
  chatId,
  handleToggle,
  launcherOpenLabel,
  launcherCloseLabel,
  launcherCloseImg,
  launcherOpenImg,
  sendButtonAlt,
  showTimeStamp,
  imagePreview,
  zoomStep,
  handleSubmit,
  showBadge,
  resizable,
  emojis,
  isShowFileUploader = true,
  isShowEmoji = true,
  quickButtonsInMessage,
  isNumeric,
  // setImageFile,
}: Props) {
  const dispatch = useDispatch();

  const toggleConversation = () => {
    dispatch(toggleChat());
    handleToggle ? handleToggle(isWidgetOpened()) : null;
  }

  const sendVideo = ({userInput}) => {
    return (
      <video id={'user-video'} muted controls autoPlay src={userInput} width={'250px'} />
    )
  }
  

  const handleMessageSubmit = (userInput) => {
    if (!userInput.trim()) {
      return;
    }
    if (userInput.includes('data:video')) { 
      const id = userInput
      handleSubmit?.(userInput);
      dispatch(addUserMessage(userInput));
      handleNewUserMessage(userInput);
      const base64Source = userInput.slice(userInput.indexOf('(') + 1, userInput.lastIndexOf(')'))
      renderCustomComponent(sendVideo, {userInput: base64Source});
    } else {
      handleSubmit?.(userInput);
      dispatch(addUserMessage(userInput));
      handleNewUserMessage(userInput);
    }
  }

  const onQuickButtonClicked = (event, value) => {
    event.preventDefault();
    handleQuickButtonClicked?.(value)
  }

  return (
    <WidgetLayout
      onToggleConversation={toggleConversation}
      onSendMessage={handleMessageSubmit}
      onQuickButtonClicked={onQuickButtonClicked}
      title={title}
      titleAvatar={titleAvatar}
      subtitle={subtitle}
      senderPlaceHolder={senderPlaceHolder}
      profileAvatar={profileAvatar}
      profileClientAvatar={profileClientAvatar}
      showCloseButton={showCloseButton}
      fullScreenMode={fullScreenMode}
      autofocus={autofocus}
      customLauncher={customLauncher}
      onTextInputChange={handleTextInputChange}
      chatId={chatId}
      launcherOpenLabel={launcherOpenLabel}
      launcherCloseLabel={launcherCloseLabel}
      launcherCloseImg={launcherCloseImg}
      launcherOpenImg={launcherOpenImg}
      sendButtonAlt={sendButtonAlt}
      showTimeStamp={showTimeStamp}
      imagePreview={imagePreview}
      zoomStep={zoomStep}
      showBadge={showBadge}
      resizable={resizable}
      emojis={emojis}
      isShowFileUploader={isShowFileUploader}
      isShowEmoji={isShowEmoji}
      quickButtonsInMessage={quickButtonsInMessage}
      isNumeric={isNumeric}
    />
  );
}

export default Widget;
