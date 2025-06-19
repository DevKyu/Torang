import { Container, ContentBox, Title, Input, Button } from '../styles/layout';

const LoginScreen = () => {
  return (
    <Container>
      <ContentBox>
        <Title>로그인</Title>
        <Input type="text" placeholder="아이디 또는 이메일" />
        <Input type="password" placeholder="비밀번호" />
        <Button>로그인</Button>
      </ContentBox>
    </Container>
  );
};

export default LoginScreen;
