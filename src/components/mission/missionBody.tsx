import { HtmlBody, PlainBody } from '../../styles/mission/MissionStyle';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

export const renderMissionBody = (content: string) =>
  content.includes('<') ? (
    <HtmlBody dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
  ) : (
    <PlainBody>{content}</PlainBody>
  );
