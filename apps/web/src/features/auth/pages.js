import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@starter/ui';
import { getFirebaseAuth } from '../../lib/firebase-client';
import { authApi } from './auth-api';
import { useAuth } from './AuthContext';
const viewStyle = { maxWidth: 560, margin: '2rem auto', padding: '1rem' };
const getGoogleLoginErrorMessage = (cause) => {
    const error = cause;
    switch (error.code) {
        case 'auth/account-exists-with-different-credential':
            return 'Esta cuenta ya existe con otro método de autenticación.';
        case 'auth/popup-closed-by-user':
            return 'Se cerró la ventana de Google antes de completar el login.';
        case 'auth/popup-blocked':
            return 'El navegador bloqueó el popup de Google. Habilítalo e inténtalo de nuevo.';
        case 'auth/cancelled-popup-request':
            return 'Ya hay una solicitud de login en curso.';
        default:
            return cause.message;
    }
};
export const RegisterPage = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    return (_jsx("main", { style: viewStyle, children: _jsxs(Card, { title: t('auth.register.title'), children: [_jsx("input", { placeholder: "Email", value: email, onChange: (e) => setEmail(e.target.value) }), _jsx("input", { placeholder: "Password", type: "password", value: password, onChange: (e) => setPassword(e.target.value) }), _jsx("button", { type: "button", onClick: async () => {
                        await authApi.register(email, password);
                        setMessage(t('auth.register.success'));
                    }, children: t('auth.register.submit') }), _jsx("p", { children: message }), _jsx(Link, { to: "/login", children: t('auth.common.goLogin') })] }) }));
};
export const LoginPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setSession } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    return (_jsx("main", { style: viewStyle, children: _jsxs(Card, { title: t('auth.login.title'), children: [_jsx("input", { placeholder: "Email", value: email, onChange: (e) => setEmail(e.target.value) }), _jsx("input", { placeholder: "Password", type: "password", value: password, onChange: (e) => setPassword(e.target.value) }), _jsx("button", { type: "button", onClick: async () => {
                        try {
                            const session = await authApi.login(email, password);
                            setSession(session.accessToken, session.user);
                            navigate('/dashboard');
                        }
                        catch (cause) {
                            setError(cause.message);
                        }
                    }, children: t('auth.login.submit') }), _jsx("button", { type: "button", onClick: async () => {
                        try {
                            const provider = new GoogleAuthProvider();
                            const auth = getFirebaseAuth();
                            const result = await signInWithPopup(auth, provider);
                            const credential = GoogleAuthProvider.credentialFromResult(result);
                            const idToken = credential?.idToken;
                            console.log('GOOGLE CREDENTIAL =>', credential);
                            console.log('GOOGLE USER =>', result.user);
                            console.log('GOOGLE PHOTO URL =>', result.user.photoURL);
                            if (!idToken) {
                                throw new Error('No se pudo obtener el Google ID token');
                            }
                            const session = await authApi.loginGoogle({ idToken, photoURL: result.user.photoURL });
                            setSession(session.accessToken, session.user);
                            navigate('/dashboard');
                        }
                        catch (cause) {
                            setError(getGoogleLoginErrorMessage(cause));
                        }
                    }, children: t('auth.login.google') }), _jsx("p", { children: error }), _jsx(Link, { to: "/forgot-password", children: t('auth.login.forgot') })] }) }));
};
export const VerifyEmailPage = () => {
    const [params] = useSearchParams();
    const { t } = useTranslation();
    const [status, setStatus] = useState('idle');
    return (_jsx("main", { style: viewStyle, children: _jsxs(Card, { title: t('auth.verify.title'), children: [_jsx("button", { type: "button", onClick: async () => {
                        const token = params.get('token') ?? '';
                        await authApi.verifyEmail(token);
                        setStatus('ok');
                    }, children: t('auth.verify.submit') }), status === 'ok' ? _jsx("p", { children: t('auth.verify.success') }) : null] }) }));
};
export const ForgotPasswordPage = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    return (_jsx("main", { style: viewStyle, children: _jsxs(Card, { title: t('auth.forgot.title'), children: [_jsx("input", { placeholder: "Email", value: email, onChange: (e) => setEmail(e.target.value) }), _jsx("button", { type: "button", onClick: async () => {
                        await authApi.forgotPassword(email);
                        setMessage(t('auth.forgot.success'));
                    }, children: t('auth.forgot.submit') }), _jsx("p", { children: message })] }) }));
};
export const ResetPasswordPage = () => {
    const { t } = useTranslation();
    const [params] = useSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    return (_jsx("main", { style: viewStyle, children: _jsxs(Card, { title: t('auth.reset.title'), children: [_jsx("input", { type: "password", value: newPassword, onChange: (e) => setNewPassword(e.target.value) }), _jsx("button", { type: "button", onClick: async () => {
                        await authApi.resetPassword(params.get('token') ?? '', newPassword);
                        setMessage(t('auth.reset.success'));
                    }, children: t('auth.reset.submit') }), _jsx("p", { children: message })] }) }));
};
export const ChangePasswordPage = () => {
    const { t } = useTranslation();
    const { accessToken } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    return (_jsx("main", { style: viewStyle, children: _jsxs(Card, { title: t('auth.change.title'), children: [_jsx("input", { type: "password", placeholder: t('auth.change.current'), value: currentPassword, onChange: (e) => setCurrentPassword(e.target.value) }), _jsx("input", { type: "password", placeholder: t('auth.change.new'), value: newPassword, onChange: (e) => setNewPassword(e.target.value) }), _jsx("button", { type: "button", onClick: async () => {
                        if (!accessToken)
                            return;
                        await authApi.changePassword(accessToken, currentPassword, newPassword);
                        setMessage(t('auth.change.success'));
                    }, children: t('auth.change.submit') }), _jsx("p", { children: message })] }) }));
};
