import { type ReactNode } from 'react';
import { Container, ContentBox, Title } from '../../styles/global/commonStyle';

type LayoutProps = {
  title?: string;
  maxWidth?: string;
  padding?: string;
  children: ReactNode;
};

const Layout = ({ title, maxWidth, padding, children }: LayoutProps) => {
  return (
    <Container>
      <ContentBox maxWidth={maxWidth} padding={padding}>
        {title && <Title>{title}</Title>}
        {children}
      </ContentBox>
    </Container>
  );
};

export default Layout;
