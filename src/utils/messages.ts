import { ElementType } from 'react';

import { MessageTypes as MessageI, Link, CustomCompMessage, LinkParams } from '../store/types';

import Message from '../components/Widget/components/Conversation/components/Messages/components/Message';
import Snippet from '../components/Widget/components/Conversation/components/Messages/components/Snippet';
import QuickButton from '../components/Widget/components/Conversation/components/QuickButtons/components/QuickButton';

import { MESSAGES_TYPES, MESSAGE_SENDER, MESSAGE_BOX_SCROLL_DURATION } from '../constants';

export function createNewMessage(
  text: string,
  sender: string,
  id?: string,
): MessageI {
  return {
    type: MESSAGES_TYPES.TEXT,
    component: Message,
    text,
    sender,
    timestamp: new Date(),
    showAvatar: true,
    customId: id,
    unread: sender === MESSAGE_SENDER.RESPONSE
  };
}

export function createLinkSnippet(link: LinkParams, id?: string) : Link {
  return {
    type: MESSAGES_TYPES.SNIPPET.LINK,
    component: Snippet,
    title: link.title,
    link: link.link,
    linkMask: link.linkMask,
    target: link.target || '_blank',
    sender: MESSAGE_SENDER.RESPONSE,
    timestamp: new Date(),
    showAvatar: true,
    customId: id,
    unread: true
  };
}

export function createComponentMessage(component: ElementType, props: any, showAvatar: boolean, id?: string): CustomCompMessage {
  return {
    type: MESSAGES_TYPES.CUSTOM_COMPONENT,
    component,
    props,
    sender: MESSAGE_SENDER.RESPONSE,
    timestamp: new Date(),
    showAvatar,
    customId: id,
    unread: true
  };
}

export function createQuickButton(button: { label: string, value: string | number }) {
  return {
    component: QuickButton,
    label: button.label,
    value: button.value
  };
}

// TODO: Clean functions and window use for SSR

function sinEaseOut(timestamp: any, begining: any, change: any, duration: any) {
  return change * ((timestamp = timestamp / duration - 1) * timestamp * timestamp + 1) + begining;
}

/**
 * 
 * @param {*} target scroll target
 * @param {*} scrollStart
 * @param {*} scroll scroll distance
 */
function scrollWithSlowMotion(target: any, scrollStart: any, scroll: number) {
  const raf = window?.requestAnimationFrame;
  let start = 0;
  const step = (timestamp) => {
    if (!start) {
      start = timestamp;
    }
    let stepScroll = sinEaseOut(timestamp - start, 0, scroll, MESSAGE_BOX_SCROLL_DURATION);
    let total = scrollStart + stepScroll;
    target.scrollTop = total;
    if (total < scrollStart + scroll) {
      raf(step);
    }
  }
  raf(step);
}

export function scrollToBottom(messagesDiv: HTMLDivElement | null) {
  if (!messagesDiv) return;
  
  // Find all messages with class 'rcw-message'
  const messages = messagesDiv.getElementsByClassName('rcw-message');
  if (messages.length === 0) return;
  
  // Find the last message that has a response child
  let lastResponseMessage: HTMLElement | null = null;
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i] as HTMLElement;
    if (message.querySelector('.rcw-response')) {
      lastResponseMessage = message;
      break;
    }
  }
  
  if (!lastResponseMessage) return;
  
  // Calculate the scroll amount needed to position the last response message below the header
  const lastMessageTop = lastResponseMessage.offsetTop;
  const currentScrollTop = messagesDiv.scrollTop;
  const scrollOffset = lastMessageTop - currentScrollTop - 100; // 81px header + 19px padding
  
  if (scrollOffset) scrollWithSlowMotion(messagesDiv, currentScrollTop, scrollOffset);
}
