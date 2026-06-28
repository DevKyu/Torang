import { type ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { checkAdminId, waitForAuthUser } from '../../services/firebase';
import { Container, ContentBox, Title } from '../../styles/global/commonStyle';
import { useRouteLoading } from '../../routes/RouteSpinner';

type AdminLayoutProps = {
  title?: string;
  children: ReactNode;
};

const AdminLayout = ({ title, children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    waitForAuthUser()
      .then(() => checkAdminId())
      .then((ok) => {
        if (!ok) navigate('/menu', { replace: true });
        else setAdminChecked(true);
      })
      .catch(() => navigate('/menu', { replace: true }));
  }, [navigate]);

  useRouteLoading(!adminChecked);

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
  height: 100vh;
  height: 100dvh;
  overflow-y: auto;
  touch-action: pan-y;
`;

const AdminBox = styled(ContentBox)`
  max-width: 720px;
  padding: 28px 32px 20px;
  text-align: left;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

export default AdminLayout;
