import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { Container, ContentBox, Title } from '../../styles/commonStyle';

type AdminLayoutProps = {
  title?: string;
  children: React.ReactNode;
};

const AdminLayout = ({ title, children }: AdminLayoutProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: 'easeOut',
      }}
    >
      <OuterWrapper>
        <Container backgroundColor="#f3f4f6">
          <AdminBox>
            {title && <Title>{title}</Title>}
            {children}
          </AdminBox>
        </Container>
      </OuterWrapper>
    </motion.div>
  );
};

const OuterWrapper = styled.div`
  min-height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const AdminBox = styled(ContentBox)`
  max-width: 720px;
  padding: 24px 28px;
  text-align: left;

  max-height: 80vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
  }
`;

export default AdminLayout;
