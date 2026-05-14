import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { checkAdminId } from '../../services/firebase';
import { Container, ContentBox, Title } from '../../styles/commonStyle';

type AdminLayoutProps = {
  title?: string;
  children: React.ReactNode;
};

const AdminLayout = ({ title, children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    checkAdminId().then((ok) => {
      if (!ok) navigate('/menu', { replace: true });
      else setAdminChecked(true);
    });
  }, [navigate]);

  if (!adminChecked) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
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
  padding: 28px 32px;
  text-align: left;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  @media (max-width: 768px) {
    padding: 20px;
    max-height: 85vh;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar { display: none; }
  }
`;

export default AdminLayout;
