import { Container, ContentBox, Title } from '../../styles/commonStyle';

type LayoutProps = {
  title?: string;
  maxWidth?: string;
  paddingLarge?: string;
  children: React.ReactNode;
};

const Layout = ({ title, maxWidth, paddingLarge, children }: LayoutProps) => {
  return (
    <Container>
      <ContentBox maxWidth={maxWidth} paddingLarge={paddingLarge}>
        {title && <Title>{title}</Title>}
        {children}
      </ContentBox>
    </Container>
  );
};

export default Layout;
