import format from 'date-fns/format';
import markdownIt from 'markdown-it';
import markdownItSup from 'markdown-it-sup';
import markdownItSanitizer from 'markdown-it-sanitizer';
import markdownItClass from '@toycode/markdown-it-class';
import markdownItLinkAttributes from 'markdown-it-link-attributes';
import markdownItUnderline from 'markdown-it-underline';

import { MessageTypes } from 'src/store/types';

import './styles.scss';

type Props = {
  message: MessageTypes;
  showTimeStamp: boolean;
}

function Message({ message, showTimeStamp }: Props) {
  if (message.text.includes('data:video')) {
    return null
  }
  const sanitizedHTML = markdownIt({ break: true })
    .use(markdownItClass, {
      img: ['rcw-message-img']
    })
    .use(markdownItUnderline)
    .use(markdownItSup)
    .use(markdownItSanitizer)
    .use(markdownItLinkAttributes, { attrs: { target: '_blank', rel: 'noopener' } })
    .render(message.text);

  return (
    <div className={`rcw-${message.sender}`}>
      <div className="rcw-message-text" dangerouslySetInnerHTML={{ __html: sanitizedHTML.replace(/\n$/,'') }} />
      {showTimeStamp && <span className="rcw-timestamp">{format(message.timestamp, 'hh:mm')}</span>}
    </div>
  );
}

export default Message;
