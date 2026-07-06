import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@starter/ui';
import { notificationsApi } from './notifications-api';
import { getWebNotificationPermission, initForegroundPushNotifications, requestWebPushToken } from './web-push';
const WEB_PUSH_TOKEN_STORAGE_KEY = 'starter_web_push_token';
const readStoredToken = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    return window.localStorage.getItem(WEB_PUSH_TOKEN_STORAGE_KEY);
};
const storeToken = (token) => {
    if (typeof window === 'undefined') {
        return;
    }
    window.localStorage.setItem(WEB_PUSH_TOKEN_STORAGE_KEY, token);
};
const clearStoredToken = () => {
    if (typeof window === 'undefined') {
        return;
    }
    window.localStorage.removeItem(WEB_PUSH_TOKEN_STORAGE_KEY);
};
export const WebPushCard = ({ accessToken }) => {
    const { t } = useTranslation();
    const [permission, setPermission] = useState(getWebNotificationPermission());
    const [token, setToken] = useState(null);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sendingTest, setSendingTest] = useState(false);
    const resolveActiveWebToken = async () => {
        const storedToken = readStoredToken();
        if (storedToken) {
            return storedToken;
        }
        const devices = await notificationsApi.listMyDevices(accessToken);
        const webDevice = devices.find((device) => device.platform === 'web' && device.channel === 'web_push' && device.status === 'active') ?? null;
        if (!webDevice) {
            return null;
        }
        storeToken(webDevice.token);
        return webDevice.token;
    };
    useEffect(() => {
        const restoreToken = async () => {
            try {
                await initForegroundPushNotifications();
            }
            catch {
                // Ignore foreground push listener init errors to avoid blocking dashboard rendering.
            }
            try {
                const activeToken = await resolveActiveWebToken();
                setToken(activeToken);
            }
            catch {
                setToken(null);
            }
        };
        void restoreToken();
    }, [accessToken]);
    const onEnable = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const nextToken = await requestWebPushToken();
            await notificationsApi.registerDevice(accessToken, { token: nextToken, platform: 'web', channel: 'web_push' });
            storeToken(nextToken);
            setToken(nextToken);
            setPermission(getWebNotificationPermission());
            setMessage(t('profile.push.enabled'));
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : t('profile.push.error'));
            setPermission(getWebNotificationPermission());
        }
        finally {
            setLoading(false);
        }
    };
    const onDisable = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const tokenToDisable = token ?? (await resolveActiveWebToken());
            if (!tokenToDisable) {
                setMessage(t('profile.push.disabled'));
                clearStoredToken();
                setToken(null);
                return;
            }
            await notificationsApi.unregisterDevice(accessToken, tokenToDisable);
            clearStoredToken();
            setToken(null);
            setMessage(t('profile.push.disabled'));
        }
        catch (disableError) {
            setError(disableError instanceof Error ? disableError.message : t('profile.push.error'));
        }
        finally {
            setLoading(false);
        }
    };
    const onSendTest = async () => {
        setSendingTest(true);
        setError(null);
        setMessage(null);
        try {
            const report = await notificationsApi.sendTestToMe(accessToken, {
                title: t('profile.push.testTitle'),
                body: t('profile.push.testBody'),
                data: { source: 'dashboard' }
            });
            setMessage(t('profile.push.testResult', { sent: report.sent, failed: report.failed }));
        }
        catch (sendError) {
            setError(sendError instanceof Error ? sendError.message : t('profile.push.error'));
        }
        finally {
            setSendingTest(false);
        }
    };
    return (_jsxs(Card, { title: t('profile.push.title'), children: [_jsx("p", { children: t('profile.push.permission', { status: permission }) }), _jsx("p", { children: t('profile.push.status', { status: token ? t('profile.push.active') : t('profile.push.inactive') }) }), _jsxs("div", { style: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }, children: [_jsx("button", { type: "button", onClick: () => void onEnable(), disabled: loading || permission === 'unsupported', children: t('profile.push.enable') }), _jsx("button", { type: "button", onClick: () => void onDisable(), disabled: loading, children: t('profile.push.disable') }), _jsx("button", { type: "button", onClick: () => void onSendTest(), disabled: sendingTest || !token, children: t('profile.push.sendTest') })] }), message ? _jsx("p", { style: { color: 'green' }, children: message }) : null, error ? _jsx("p", { style: { color: 'crimson' }, children: error }) : null] }));
};
