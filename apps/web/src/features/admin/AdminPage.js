import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@starter/ui';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import { featureFlags } from '../../config';
import { adminApi } from './admin-api';
const tableWrapper = { overflowX: 'auto', width: '100%' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', minWidth: 640 };
export const AdminPage = () => {
    const { t } = useTranslation();
    const { accessToken } = useAuth();
    const [section, setSection] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [users, setUsers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [avatars, setAvatars] = useState([]);
    const [monetizationConfig, setMonetizationConfig] = useState(null);
    const [notificationForm, setNotificationForm] = useState({ targetUserId: '', title: '', body: '' });
    const sections = useMemo(() => [
        { id: 'dashboard', label: t('admin.navigation.dashboard') },
        { id: 'users', label: t('admin.navigation.users') },
        ...(featureFlags.billing ? ([
            { id: 'payments', label: t('admin.navigation.payments') },
            { id: 'subscriptions', label: t('admin.navigation.subscriptions') }
        ]) : []),
        { id: 'notifications', label: t('admin.navigation.notifications') },
        { id: 'avatars', label: t('admin.navigation.avatars') },
        ...(featureFlags.billing ? [{ id: 'monetization', label: t('admin.navigation.monetization') }] : [])
    ], [t]);
    useEffect(() => {
        if (!accessToken) {
            return;
        }
        const loadSection = async () => {
            setLoading(true);
            setError(null);
            setSuccess(null);
            try {
                if (section === 'dashboard')
                    setDashboard(await adminApi.getDashboard(accessToken));
                if (section === 'users')
                    setUsers((await adminApi.listUsers(accessToken, new URLSearchParams({ page: '1', limit: '20' }))).items);
                if (featureFlags.billing && section === 'payments')
                    setPayments((await adminApi.listPayments(accessToken, new URLSearchParams({ page: '1', limit: '20' }))).items);
                if (featureFlags.billing && section === 'subscriptions') {
                    setSubscriptions((await adminApi.listSubscriptions(accessToken, new URLSearchParams({ page: '1', limit: '20' }))).items);
                }
                if (section === 'avatars')
                    setAvatars((await adminApi.listAvatars(accessToken, new URLSearchParams({ page: '1', limit: '20', hasAvatar: 'true' }))).items);
                if (featureFlags.billing && section === 'monetization')
                    setMonetizationConfig(await adminApi.getMonetizationConfig(accessToken));
            }
            catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : t('admin.common.loadError'));
            }
            finally {
                setLoading(false);
            }
        };
        void loadSection();
    }, [accessToken, section, t]);
    const updateNotificationField = (field) => (event) => {
        setNotificationForm((current) => ({ ...current, [field]: event.target.value }));
    };
    const onSendNotification = async () => {
        if (!accessToken)
            return;
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await adminApi.sendNotification(accessToken, notificationForm);
            setSuccess(t('admin.notifications.success'));
        }
        catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : t('admin.notifications.error'));
        }
        finally {
            setLoading(false);
        }
    };
    const onRoleChange = async (userId, role) => {
        if (!accessToken)
            return;
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await adminApi.updateUserRole(accessToken, userId, role);
            setUsers((current) => current.map((user) => (user.id === userId ? { ...user, role } : user)));
            setSuccess(t('admin.users.roleUpdated'));
        }
        catch (actionError) {
            setError(actionError instanceof Error ? actionError.message : t('admin.common.actionError'));
        }
        finally {
            setLoading(false);
        }
    };
    const onDeleteAvatar = async (userId) => {
        if (!accessToken)
            return;
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await adminApi.deleteAvatar(accessToken, userId);
            setAvatars((current) => current.filter((item) => item.userId !== userId));
            setSuccess(t('admin.avatars.deleted'));
        }
        catch (actionError) {
            setError(actionError instanceof Error ? actionError.message : t('admin.common.actionError'));
        }
        finally {
            setLoading(false);
        }
    };
    const onUpdateMonetization = async (next) => {
        if (!accessToken)
            return;
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const updated = await adminApi.updateMonetizationConfig(accessToken, next);
            setMonetizationConfig(updated);
            setSuccess(t('admin.monetization.updated'));
        }
        catch (actionError) {
            setError(actionError instanceof Error ? actionError.message : t('admin.common.actionError'));
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("main", { style: { maxWidth: 1100, margin: '1.5rem auto', padding: '1rem' }, children: _jsx(Card, { title: t('admin.title'), children: _jsxs("div", { style: { display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%, 260px),1fr))' }, children: [_jsx("nav", { style: { display: 'grid', gap: '0.5rem' }, children: sections.map((item) => (_jsx("button", { type: "button", onClick: () => setSection(item.id), disabled: loading, children: item.label }, item.id))) }), _jsxs("section", { children: [loading ? _jsx("p", { children: t('admin.common.loading') }) : null, error ? _jsx("p", { style: { color: 'crimson' }, children: error }) : null, success ? _jsx("p", { style: { color: 'green' }, children: success }) : null, section === 'dashboard' && dashboard ? (_jsxs("div", { style: { display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }, children: [_jsx(Card, { title: t('admin.dashboard.totalUsers'), children: _jsx("p", { children: dashboard.users }) }), _jsx(Card, { title: t('admin.dashboard.adminUsers'), children: _jsx("p", { children: dashboard.adminUsers }) }), featureFlags.billing ? _jsx(Card, { title: t('admin.dashboard.payments'), children: _jsx("p", { children: dashboard.payments }) }) : null, featureFlags.billing ? _jsx(Card, { title: t('admin.dashboard.subscriptions'), children: _jsx("p", { children: dashboard.subscriptions }) }) : null, _jsx(Card, { title: t('admin.comparator.wholesalers'), children: _jsx("p", { children: t('admin.comparator.soon') }) }), _jsx(Card, { title: t('admin.comparator.branches'), children: _jsx("p", { children: t('admin.comparator.soon') }) }), _jsx(Card, { title: t('admin.comparator.priceLists'), children: _jsx("p", { children: t('admin.comparator.soon') }) }), _jsx(Card, { title: t('admin.comparator.products'), children: _jsx("p", { children: t('admin.comparator.soon') }) }), _jsx(Card, { title: t('admin.comparator.imports'), children: _jsx("p", { children: t('admin.comparator.soon') }) }), _jsx(Card, { title: t('admin.comparator.users'), children: _jsx("p", { children: t('admin.comparator.soon') }) }), _jsx(Card, { title: t('admin.dashboard.pushDevices'), children: _jsx("p", { children: dashboard.pushDevices }) }), _jsx(Card, { title: t('admin.dashboard.usersWithAvatar'), children: _jsx("p", { children: dashboard.usersWithAvatar }) })] })) : null, section === 'users' ? (_jsx("div", { style: tableWrapper, children: _jsxs("table", { style: tableStyle, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: t('admin.users.email') }), _jsx("th", { children: t('admin.users.role') }), _jsx("th", { children: t('admin.users.provider') }), _jsx("th", { children: t('admin.users.verified') }), _jsx("th", { children: t('admin.users.actions') })] }) }), _jsx("tbody", { children: users.map((user) => _jsxs("tr", { children: [_jsx("td", { children: user.email }), _jsx("td", { children: user.role }), _jsx("td", { children: user.provider }), _jsx("td", { children: user.emailVerified ? t('admin.common.yes') : t('admin.common.no') }), _jsx("td", { children: _jsx("button", { type: "button", onClick: () => void onRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin'), children: t('admin.users.toggleRole') }) })] }, user.id)) })] }) })) : null, section === 'payments' ? (_jsx("div", { style: tableWrapper, children: _jsxs("table", { style: tableStyle, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "ID" }), _jsx("th", { children: t('admin.payments.user') }), _jsx("th", { children: t('admin.payments.type') }), _jsx("th", { children: t('admin.payments.status') }), _jsx("th", { children: t('admin.payments.amount') })] }) }), _jsx("tbody", { children: payments.map((payment) => _jsxs("tr", { children: [_jsx("td", { children: payment.id }), _jsx("td", { children: payment.userEmail ?? payment.userId }), _jsx("td", { children: payment.type }), _jsx("td", { children: payment.status }), _jsxs("td", { children: [payment.amount, " ", payment.currency] })] }, payment.id)) })] }) })) : null, section === 'subscriptions' ? (_jsx("div", { style: tableWrapper, children: _jsxs("table", { style: tableStyle, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "ID" }), _jsx("th", { children: t('admin.subscriptions.user') }), _jsx("th", { children: t('admin.subscriptions.period') }), _jsx("th", { children: t('admin.subscriptions.status') }), _jsx("th", { children: t('admin.subscriptions.externalReference') })] }) }), _jsx("tbody", { children: subscriptions.map((item) => _jsxs("tr", { children: [_jsx("td", { children: item.id }), _jsx("td", { children: item.userEmail ?? item.userId }), _jsx("td", { children: item.period }), _jsx("td", { children: item.status }), _jsx("td", { children: item.externalReference })] }, item.id)) })] }) })) : null, section === 'notifications' ? (_jsxs("div", { style: { display: 'grid', gap: '0.5rem', maxWidth: 520 }, children: [_jsx("input", { placeholder: t('admin.notifications.targetUserPlaceholder'), value: notificationForm.targetUserId, onChange: updateNotificationField('targetUserId') }), _jsx("input", { placeholder: t('admin.notifications.titlePlaceholder'), value: notificationForm.title, onChange: updateNotificationField('title') }), _jsx("textarea", { placeholder: t('admin.notifications.bodyPlaceholder'), value: notificationForm.body, onChange: updateNotificationField('body') }), _jsx("button", { type: "button", onClick: () => void onSendNotification(), disabled: loading, children: t('admin.notifications.submit') })] })) : null, section === 'avatars' ? (_jsx("div", { style: tableWrapper, children: _jsxs("table", { style: tableStyle, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: t('admin.avatars.user') }), _jsx("th", { children: t('admin.avatars.avatar') }), _jsx("th", { children: t('admin.avatars.actions') })] }) }), _jsx("tbody", { children: avatars.map((item) => _jsxs("tr", { children: [_jsx("td", { children: item.email }), _jsx("td", { children: item.avatarUrl ? _jsx("img", { src: item.avatarUrl, alt: t('admin.avatars.imageAlt'), width: 52, height: 52, style: { borderRadius: '50%' } }) : t('admin.avatars.noAvatar') }), _jsx("td", { children: _jsx("button", { type: "button", onClick: () => void onDeleteAvatar(item.userId), children: t('admin.avatars.delete') }) })] }, item.userId)) })] }) })) : null, section === 'monetization' && monetizationConfig ? (_jsxs("div", { style: { display: 'grid', gap: '0.5rem', maxWidth: 420 }, children: [_jsxs("label", { children: [t('admin.monetization.mode'), _jsxs("select", { value: monetizationConfig.monetizationMode, onChange: (event) => setMonetizationConfig((current) => current ? { ...current, monetizationMode: event.target.value } : current), children: [_jsx("option", { value: "one_time_only", children: "one_time_only" }), _jsx("option", { value: "subscriptions_only", children: "subscriptions_only" }), _jsx("option", { value: "both", children: "both" })] })] }), _jsxs("label", { children: [t('admin.monetization.periodMode'), _jsxs("select", { value: monetizationConfig.subscriptionPeriodMode, onChange: (event) => setMonetizationConfig((current) => current ? { ...current, subscriptionPeriodMode: event.target.value } : current), children: [_jsx("option", { value: "monthly", children: "monthly" }), _jsx("option", { value: "yearly", children: "yearly" }), _jsx("option", { value: "both", children: "both" })] })] }), _jsx("button", { type: "button", onClick: () => void onUpdateMonetization(monetizationConfig), children: t('admin.monetization.save') })] })) : null] })] }) }) }));
};
