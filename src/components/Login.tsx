import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
  anonLogin,
  checkEmpId,
  loginUser,
  registerUid,
  linkAnonymousAccount,
  logOut,
} from '../services/firebase';
import { useLoading } from '../contexts/LoadingContext';
import { Button } from '../styles/commonStyle';
import { Input, ErrorText } from '../styles/loginStyle';
import Layout from './layouts/Layout';

const Login = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const [isPasswordChangeMode, setIsPasswordChangeMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isValid = (val: string, max = 20) => val.length <= max;

    switch (name) {
      case 'employeeId':
        if (/^\d*$/.test(value) && isValid(value, 8)) setEmployeeId(value);
        break;
      case 'password':
        if (isValid(value)) setPassword(value);
        break;
      case 'newPassword':
        if (isValid(value)) setNewPassword(value);
        break;
      case 'newPasswordConfirm':
        if (isValid(value)) setNewPasswordConfirm(value);
        break;
    }
  };

  const validateInput = () => {
    if (!employeeId || !password) {
      toast.warning('사번과 비밀번호를 입력해 주세요.');
      return false;
    }
    return true;
  };

  const isValidPassword = () => {
    if (password.length < 8) {
      toast.warning('비밀번호는 8자 이상이어야 해요.');
      return false;
    }
    return true;
  };

  const isValidNewPassword = () => {
    if (newPassword.length < 8 || newPasswordConfirm.length < 8) {
      setError('비밀번호는 8자 이상이어야 해요.');
      return false;
    }
    return true;
  };

  const isValidSamePassword = () => {
    if (newPassword !== newPasswordConfirm) {
      setError('비밀번호가 일치하지 않아요.');
      return false;
    }
    return true;
  };

  const handleClickLogin = async () => {
    if (!validateInput() || !isValidPassword()) return;

    showLoading();

    try {
      const user = await loginUser(`${employeeId}@torang.com`, password);
      if (user) {
        toast.success('로그인 되었습니다.');
        navigate('/menu', { replace: true });
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
            toast.error('등록되지 않은 사번이에요.');
            await logOut();
          }
        } catch {
          toast.error('사번 또는 비밀번호가 올바르지 않아요.');
          await logOut();
        }
      } else if (
        ['auth/too-many-requests', 'auth/network-request-failed'].includes(code)
      ) {
        toast.warning('잠시 후 다시 시도해 주세요.');
      } else {
        toast.error('사번 또는 비밀번호가 올바르지 않아요.');
      }
    } finally {
      hideLoading();
    }
  };

  const handleClickChangePassword = async () => {
    if (!isValidNewPassword() || !isValidSamePassword()) return;

    setError('');
    showLoading();

    try {
      const user = await linkAnonymousAccount(
        `${employeeId}@torang.com`,
        newPassword,
      );
      if (user) {
        await registerUid(employeeId);
        toast.success('비밀번호를 변경했어요.');

        navigate('/menu', { replace: true });
      }
    } catch {
      toast.error('비밀번호 변경에 실패했어요.');
    } finally {
      hideLoading();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (isPasswordChangeMode) {
        await handleClickChangePassword();
      } else {
        await handleClickLogin();
      }
    } finally {
      setIsSubmitting(false);
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
      <form onSubmit={handleSubmit}>
        <div>{renderInputs()}</div>
        {isPasswordChangeMode && <div>{renderChangePasswordInputs()}</div>}
        {error && <ErrorText>{error}</ErrorText>}
        <Button type="submit" disabled={isSubmitting}>
          {isPasswordChangeMode ? '비밀번호 변경' : '로그인'}
        </Button>
      </form>
    </Layout>
  );
};

export default Login;
