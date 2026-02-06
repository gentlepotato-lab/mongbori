import { api, setToken, User } from '../api/client';
import { showPanel } from './screens';

const setMessage = (el: HTMLElement | null, message: string) => {
  if (!el) return;
  el.textContent = message;
};

export const initAuth = (onAuthed: (user: User) => void) => {
  const loginTab = document.getElementById('tab-login');
  const registerTab = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form') as HTMLFormElement | null;
  const registerForm = document.getElementById('register-form') as HTMLFormElement | null;
  const loginMessage = document.getElementById('login-message');
  const registerMessage = document.getElementById('register-message');

  const toggle = (mode: 'login' | 'register') => {
    if (mode === 'login') {
      loginForm?.classList.remove('hidden');
      registerForm?.classList.add('hidden');
      loginTab?.classList.add('active');
      registerTab?.classList.remove('active');
    } else {
      registerForm?.classList.remove('hidden');
      loginForm?.classList.add('hidden');
      registerTab?.classList.add('active');
      loginTab?.classList.remove('active');
    }
  };

  loginTab?.addEventListener('click', () => toggle('login'));
  registerTab?.addEventListener('click', () => toggle('register'));

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(loginMessage, '');

    const formData = new FormData(loginForm);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    try {
      const result = await api.login(email, password);
      setToken(result.token);
      onAuthed(result.user);
      showPanel('menu');
    } catch (error) {
      setMessage(loginMessage, '로그인에 실패했어요. 다시 확인해주세요.');
    }
  });

  registerForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(registerMessage, '');

    const formData = new FormData(registerForm);
    const displayName = String(formData.get('displayName') ?? '');
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    try {
      const result = await api.register(displayName, email, password);
      setToken(result.token);
      onAuthed(result.user);
      showPanel('menu');
    } catch (error) {
      setMessage(registerMessage, '가입에 실패했어요. 입력값을 확인해주세요.');
    }
  });
};