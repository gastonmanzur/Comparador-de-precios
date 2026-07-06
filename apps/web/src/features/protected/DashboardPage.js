import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@starter/ui';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import { authApi } from '../auth/auth-api';
import { WebPushCard } from '../notifications/WebPushCard';
import { MonetizationCard } from '../payments/MonetizationCard';
import { featureFlags } from '../../config';
import { resolveAvatarUrl } from '../../lib/resolve-avatar-url';
const MAX_SIZE_BYTES = 2_097_152;
export const DashboardPage = () => {
    const { t } = useTranslation();
    const { user, accessToken, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [error, setError] = useState(null);
    const isGoogleUser = user?.provider === 'google';
    const avatarUrl = user?.avatar?.url ? resolveAvatarUrl(user.avatar.url) : null;
    const onAvatarChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        if (!file.type.startsWith('image/')) {
            setError(t('profile.avatar.invalidType'));
            return;
        }
        if (file.size > MAX_SIZE_BYTES) {
            setError(t('profile.avatar.invalidSize'));
            return;
        }
        if (!accessToken || !user) {
            return;
        }
        setLoading(true);
        setError(null);
        setFeedback(null);
        try {
            await authApi.uploadMyAvatar(accessToken, file);
            const refreshedUser = await authApi.me(accessToken);
            updateUser(refreshedUser);
            setFeedback(t('profile.avatar.uploadSuccess'));
        }
        catch (uploadError) {
            setError(uploadError instanceof Error ? uploadError.message : t('profile.avatar.unexpectedError'));
        }
        finally {
            setLoading(false);
            event.target.value = '';
        }
    };
    const onDeleteAvatar = async () => {
        if (!accessToken || !user) {
            return;
        }
        setLoading(true);
        setError(null);
        setFeedback(null);
        try {
            await authApi.deleteMyAvatar(accessToken);
            const refreshedUser = await authApi.me(accessToken);
            updateUser(refreshedUser);
            setFeedback(t('profile.avatar.deleteSuccess'));
        }
        catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : t('profile.avatar.unexpectedError'));
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("main", { style: { maxWidth: 760, margin: '2rem auto', padding: '1rem' }, children: _jsxs(Card, { title: t('profile.title'), children: [_jsx("p", { children: t('profile.greeting', { email: user?.email ?? '-' }) }), _jsx("p", { children: t('profile.role', { role: user?.role ?? '-' }) }), _jsxs("section", { children: [_jsx("h3", { children: t('profile.avatar.title') }), avatarUrl ? (_jsx("img", { src: avatarUrl, alt: t('profile.avatar.alt'), width: 96, height: 96, style: { borderRadius: '50%', objectFit: 'cover', border: '1px solid #ddd' } })) : (_jsx("p", { children: t('profile.avatar.empty') })), isGoogleUser ? (_jsx("p", { children: t('profile.avatar.googleManaged') })) : (_jsxs("div", { style: { marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }, children: [_jsx("input", { type: "file", accept: "image/png,image/jpeg,image/webp", onChange: onAvatarChange, disabled: loading }), _jsx("button", { type: "button", onClick: onDeleteAvatar, disabled: loading || !user?.avatar?.url, children: t('profile.avatar.delete') })] })), loading ? _jsx("p", { children: t('profile.avatar.loading') }) : null, feedback ? _jsx("p", { style: { color: 'green' }, children: feedback }) : null, error ? _jsx("p", { style: { color: 'crimson' }, children: error }) : null] }), accessToken ? _jsx(WebPushCard, { accessToken: accessToken }) : null, accessToken && featureFlags.billing ? _jsx(MonetizationCard, { accessToken: accessToken }) : null, _jsx(Link, { to: "/change-password", children: t('profile.changePassword') })] }) }));
};
