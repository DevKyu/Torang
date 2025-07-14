import { motion } from 'framer-motion';
import { Container, ContentBox, Title } from '../../styles/commonStyle';

type LayoutProps = {
  title?: string;
  maxWidth?: string;
  padding?: string;
  children: React.ReactNode;
};

const Layout = ({ title, maxWidth, padding, children }: LayoutProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        ease: 'easeOut',
      }}
    >
      <Container>
        <ContentBox maxWidth={maxWidth} padding={padding}>
          {title && <Title>{title}</Title>}
          {children}
        </ContentBox>
      </Container>
    </motion.div>
  );
};

export default Layout;
