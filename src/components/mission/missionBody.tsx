import { HtmlBody, PlainBody } from '../../styles/mission/MissionStyle';

export const renderMissionBody = (content: string) =>
  content.includes('<') ? (
    <HtmlBody dangerouslySetInnerHTML={{ __html: content }} />
  ) : (
    <PlainBody>{content}</PlainBody>
  );
