import { useState, type ChangeEvent } from 'react';
import {
  anonLogin,
  checkEmpId,
  loginUser,
  registerUid,
  linkAnonymousAccount,
  logOut,
} from '../services/firebase';
import { Input, Button, ErrorText } from '../styles/commonStyle';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from './layouts/Layout';

const Login = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [isPasswordChangeMode, setIsPasswordChangeMode] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case 'employeeId':
        if (/^\d*$/.test(value) && value.length <= 8) {
          setEmployeeId(value);
        }
        break;
      case 'password':
        if (value.length <= 20) {
          setPassword(value);
        }
        break;
      case 'newPassword':
        if (value.length <= 20) {
          setNewPassword(value);
        }
        break;
      case 'newPasswordConfirm':
        if (value.length <= 20) {
          setNewPasswordConfirm(value);
        }
        break;
    }
  };

  const validateInput = () => {
    if (!employeeId || !password) {
      toast.warning('사번 혹은 비밀번호를 입력해 주세요.');
      return false;
    }
    return true;
  };

  const isValidPassword = () => {
    if (password.length < 8) {
      toast.warning('비밀번호는 8자 이상이어야 합니다.');
      return false;
    }
    return true;
  };

  const handleClickLogin = async () => {
    if (!validateInput()) return;

    if (!isValidPassword()) return;

    try {
      const user = await loginUser(`${employeeId}@torang.com`, password);
      if (user) {
        toast.success('로그인 완료!');
        setTimeout(() => {
          navigate('/reward');
        }, 1000);
      }
    } catch (error: any) {
      const code = error.code;
      const isInitialPassword =
        employeeId.startsWith('2016') &&
        employeeId.length === 8 &&
        employeeId === password;

      if (
        [
          'auth/invalid-credential',
          'auth/missing-password',
          'auth/invalid-email',
        ].includes(code) &&
        isInitialPassword
      ) {
        try {
          await anonLogin();
          const result = await checkEmpId(employeeId);

          if (result) {
            setIsPasswordChangeMode(true);
          } else {
            toast.error('사번을 찾을 수 없습니다.');
            await logOut();
          }
        } catch {
          toast.error('사번과 비밀번호를 다시 확인해 주세요.');
          await logOut();
        }
      } else if (
        code === 'auth/too-many-requests' ||
        code === 'auth/network-request-failed'
      ) {
        toast.warning('잠시 후 다시 시도해 주세요.');
      } else {
        toast.error('사번과 비밀번호를 다시 확인해 주세요.');
      }
    }
  };

  const isValidNewPassword = () => {
    if (newPassword.length < 8 || newPasswordConfirm.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return false;
    }
    return true;
  };

  const isValidSamePassword = () => {
    if (newPassword !== newPasswordConfirm) {
      setError('비밀번호가 다릅니다.');
      return false;
    }
    return true;
  };

  const handleClickChangePassword = async () => {
    if (!isValidNewPassword()) return;
    if (!isValidSamePassword()) return;

    setError('');
    try {
      const user = await linkAnonymousAccount(
        `${employeeId}@torang.com`,
        newPassword,
      );

      if (user) {
        await registerUid(employeeId);
        toast.success('비밀번호 변경 완료!');
        setTimeout(() => {
          navigate('/reward');
        }, 1000);
      }
    } catch {
      toast.error('비밀번호 변경 실패');
    }
  };

  const renderInputs = () => (
    <>
      <Input
        type="text"
        name="employeeId"
        placeholder="사번"
        autoComplete="username"
        onChange={handleChange}
        disabled={isPasswordChangeMode}
        value={employeeId}
      />
      <Input
        type="password"
        name="password"
        placeholder="비밀번호"
        autoComplete="current-password"
        onChange={handleChange}
        disabled={isPasswordChangeMode}
        value={password}
      />
    </>
  );

  const renderChangePasswordInputs = () => (
    <>
      <Input
        type="password"
        name="newPassword"
        placeholder="새로운 비밀번호"
        autoComplete="new-password"
        onChange={handleChange}
        value={newPassword}
      />
      <Input
        type="password"
        name="newPasswordConfirm"
        placeholder="새로운 비밀번호 확인"
        autoComplete="new-password"
        onChange={handleChange}
        value={newPasswordConfirm}
      />
    </>
  );

  return (
    <Layout title="또랑 로그인🎳">
      <div>{renderInputs()}</div>
      {isPasswordChangeMode && <div>{renderChangePasswordInputs()}</div>}
      {error && <ErrorText>{error}</ErrorText>}
      <Button
        onClick={
          isPasswordChangeMode ? handleClickChangePassword : handleClickLogin
        }
      >
        {isPasswordChangeMode ? '비밀번호 변경' : '로그인'}
      </Button>
    </Layout>
  );
};

export default Login;
