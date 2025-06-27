import { Container, ContentBox, Title } from '../../styles/commonStyle';

type LayoutProps = {
  title?: string;
  children: React.ReactNode;
};

const Layout = ({ title, children }: LayoutProps) => {
  return (
    <Container>
      <ContentBox>
        {title && <Title>{title}</Title>}
        {children}
      </ContentBox>
    </Container>
  );
};

export default Layout;
