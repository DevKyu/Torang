import { type ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { checkAdminId, waitForAuthUser } from '../../services/firebase';
import { Container, Title } from '../../styles/global/commonStyle';
import { useRouteLoading } from '../../routes/RouteSpinner';
import { OuterWrapper, AdminBox } from '../../styles/admin/AdminLayoutStyle';

type AdminLayoutProps = {
  title?: string;
  children: ReactNode;
};

const AdminLayout = ({ title, children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    waitForAuthUser()
      .then(() => checkAdminId())
      .then((ok) => {
        if (cancelled) return;
        if (!ok) navigate('/menu', { replace: true });
        else setAdminChecked(true);
      })
      .catch(() => {
        if (!cancelled) navigate('/menu', { replace: true });
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useRouteLoading(!adminChecked);

  if (!adminChecked) return null;

  return (
    <OuterWrapper>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Container backgroundColor="#f3f4f6">
          <AdminBox>
            {title && <Title>{title}</Title>}
            {children}
          </AdminBox>
        </Container>
      </motion.div>
    </OuterWrapper>
  );
};

export default AdminLayout;
