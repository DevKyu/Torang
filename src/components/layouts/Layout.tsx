import { Container, ContentBox, Title } from '../../styles/commonStyle';

type LayoutProps = {
  title?: string;
  maxWidth?: string;
  padding?: string;
  children: React.ReactNode;
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
