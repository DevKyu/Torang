import {
  useState,
  useEffect,
  useRef,
  type FormEvent,
  type ChangeEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { deleteUser, updatePassword } from 'firebase/auth';
import {
  auth,
  anonLogin,
  checkEmpId,
  loginUser,
  registerUid,
  linkAnonymousAccount,
  logOut,
} from '../services/firebase';
import { useLoading } from '../contexts/LoadingContext';
import { Button, SmallText } from '../styles/commonStyle';
import { Input, ErrorText } from '../styles/loginStyle';
import Layout from './layouts/Layout';

const Login = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [isPasswordChangeMode, setIsPasswordChangeMode] = useState(false);
  const [isPasswordResetMode, setIsPasswordResetMode] = useState(false);
  const [referrerName, setReferrerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();
  const newPasswordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isPasswordChangeMode && newPasswordRef.current) {
      newPasswordRef.current.focus();
    }
  }, [isPasswordChangeMode]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isValid = (val: string, max = 20) => val.length <= max;

    switch (name) {
      case 'employeeId':
        if (/^\d*$/.test(value)) setEmployeeId(value.slice(0, 8));
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
      case 'referrerName':
        setReferrerName(value.slice(0, 10));
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

  const isInvalidNewPasswordPattern = () => {
    if (newPassword === '00000000') {
      setError('초기 비밀번호(00000000)는 사용할 수 없어요.');
      return true;
    }
    if (newPassword === employeeId) {
      setError('사번과 동일한 비밀번호는 사용할 수 없어요.');
      return true;
    }
    return false;
  };

  const safeLogout = async () => {
    const user = auth.currentUser;
    if (user?.isAnonymous) {
      await deleteUser(user).catch(() => {});
    } else {
      await logOut();
    }
  };

  const handleClickLogin = async () => {
    if (!validateInput() || !isValidPassword()) return;
    showLoading();

    try {
      const email = `${employeeId}@torang.com`;
      const user = await loginUser(email, password);

      if (user) {
        if (password === '00000000') {
          setIsPasswordResetMode(true);
          toast.info('임시 비밀번호입니다.\n새로운 비밀번호를 설정해 주세요.', {
            style: { whiteSpace: 'pre-line' },
          });
          setIsPasswordChangeMode(true);
        } else {
          toast.success('로그인이 완료됐어요.');
          navigate('/menu', { replace: true });
        }
        return;
      }
    } catch (error: any) {
      const code = error.code;
      const isInitialPassword =
        employeeId.length === 8 &&
        employeeId === password &&
        employeeId.startsWith('2016');
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
          const userData = await checkEmpId(employeeId);

          if (userData?.uid) {
            toast.info(
              '이미 등록된 계정이에요.\n비밀번호 초기화를 원하시면 문의해 주세요.',
              { style: { whiteSpace: 'pre-line' } },
            );
            await safeLogout();
          } else if (!userData) {
            toast.info('등록되지 않은 계정이에요.');
          } else {
            setIsPasswordChangeMode(true);
          }
        } catch {
          toast.error('사번 또는 비밀번호가 올바르지 않아요.');
          await safeLogout();
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
    if (
      !isValidNewPassword() ||
      !isValidSamePassword() ||
      isInvalidNewPasswordPattern()
    )
      return;

    setError('');
    showLoading();

    const email = `${employeeId}@torang.com`;

    try {
      if (auth.currentUser && !auth.currentUser.isAnonymous) {
        await updatePassword(auth.currentUser, newPassword);
        toast.success('비밀번호가 변경되었어요.');
        await logOut();
        await loginUser(email, newPassword);
        navigate('/menu', { replace: true });
        return;
      }

      const user = await linkAnonymousAccount(email, newPassword);
      await registerUid(employeeId, referrerName);
      if (user) {
        toast.success('비밀번호를 설정했어요.');
        navigate('/menu', { replace: true });
      }
    } catch {
      toast.error('비밀번호 변경 중 오류가 발생했어요.');
    } finally {
      hideLoading();
    }
  };

  const handleCancelChange = async () => {
    const user = auth.currentUser;
    if (user?.isAnonymous) {
      await deleteUser(user).catch(() => {});
    }

    setIsPasswordChangeMode(false);
    setIsPasswordResetMode(false);
    setError('');
    setNewPassword('');
    setNewPasswordConfirm('');
    setReferrerName('');
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

  const renderLoginInputs = () => (
    <>
      <Input
        type="text"
        name="employeeId"
        placeholder="사번"
        autoComplete="username"
        onChange={handleChange}
        disabled={isPasswordChangeMode}
        value={employeeId}
        maxLength={8}
      />
      <Input
        type="password"
        name="password"
        placeholder="비밀번호"
        autoComplete="current-password"
        onChange={handleChange}
        disabled={isPasswordChangeMode}
        value={password}
        maxLength={20}
      />
    </>
  );

  const renderChangePasswordInputs = () => (
    <>
      <Input
        ref={newPasswordRef}
        type="password"
        name="newPassword"
        placeholder="새로운 비밀번호"
        autoComplete="new-password"
        onChange={handleChange}
        value={newPassword}
        maxLength={20}
      />
      <Input
        type="password"
        name="newPasswordConfirm"
        placeholder="새로운 비밀번호 확인"
        autoComplete="new-password"
        onChange={handleChange}
        value={newPasswordConfirm}
        maxLength={20}
      />
      {!isPasswordResetMode && (
        <Input
          type="text"
          name="referrerName"
          placeholder="추천인 이름 (선택)"
          onChange={handleChange}
          value={referrerName}
          maxLength={10}
        />
      )}
    </>
  );

  return (
    <Layout title="또랑 로그인🎳">
      <AnimatePresence mode="wait" initial={false}>
        <motion.form
          key={isPasswordChangeMode ? 'change' : 'login'}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <div>
            {isPasswordChangeMode
              ? renderChangePasswordInputs()
              : renderLoginInputs()}
          </div>
          {error && <ErrorText>{error}</ErrorText>}
          <Button type="submit" disabled={isSubmitting}>
            {isPasswordChangeMode ? '비밀번호 변경' : '로그인'}
          </Button>
          {isPasswordChangeMode && (
            <SmallText top="narrow" onClick={handleCancelChange}>
              돌아가기
            </SmallText>
          )}
        </motion.form>
      </AnimatePresence>
    </Layout>
  );
};

export default Login;
