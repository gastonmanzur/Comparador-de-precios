import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { paymentsApi } from './payments-api';
export const MonetizationCard = ({ accessToken }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [syncingStatus, setSyncingStatus] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [lastOrderId, setLastOrderId] = useState(null);
    const [lastStatus, setLastStatus] = useState(null);
    const [lastSubscriptionId, setLastSubscriptionId] = useState(null);
    const [lastSubscriptionPeriod, setLastSubscriptionPeriod] = useState(null);
    const [lastSubscriptionStatus, setLastSubscriptionStatus] = useState(null);
    const openCheckout = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };
    const onBuy = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const result = await paymentsApi.createOneTime(accessToken, {
                title: 'Compra única Starter',
                amount: 2990,
                currency: 'ARS'
            });
            setLastOrderId(result.orderId);
            setLastStatus(result.status);
            setMessage(t('payments.pending'));
            openCheckout(result.checkoutUrl);
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : t('payments.error'));
        }
        finally {
            setLoading(false);
        }
    };
    const onSubscribe = async (period) => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const result = await paymentsApi.createSubscription(accessToken, {
                planCode: `starter_${period}`,
                title: period === 'monthly' ? 'Starter mensual' : 'Starter anual',
                amount: period === 'monthly' ? 1990 : 19900,
                currency: 'ARS',
                period
            });
            setLastSubscriptionId(result.subscriptionId);
            setLastSubscriptionPeriod(period);
            setLastSubscriptionStatus(result.status);
            setMessage(t('payments.pending'));
            openCheckout(result.checkoutUrl);
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : t('payments.error'));
        }
        finally {
            setLoading(false);
        }
    };
    const onRefreshStatus = async () => {
        if (!lastOrderId) {
            return;
        }
        setSyncingStatus(true);
        setError(null);
        setMessage(null);
        try {
            const result = await paymentsApi.getOrderStatus(accessToken, lastOrderId, true);
            setLastStatus(result.status);
            setMessage(t('payments.statusUpdated'));
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : t('payments.error'));
        }
        finally {
            setSyncingStatus(false);
        }
    };
    const onRefreshSubscription = async () => {
        if (!lastSubscriptionId) {
            return;
        }
        setSyncingStatus(true);
        setError(null);
        setMessage(null);
        try {
            const result = await paymentsApi.getMySubscriptionStatus(accessToken, {
                subscriptionId: lastSubscriptionId,
                ...(lastSubscriptionPeriod ? { period: lastSubscriptionPeriod } : {}),
                sync: true
            });
            setLastSubscriptionStatus(result.status);
            setMessage(t('payments.statusUpdated'));
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : t('payments.error'));
        }
        finally {
            setSyncingStatus(false);
        }
    };
    return (_jsxs("section", { style: { marginTop: '1rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }, children: [_jsx("h3", { children: t('payments.title') }), _jsx("p", { children: t('payments.subtitle') }), _jsxs("div", { style: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }, children: [_jsx("button", { type: "button", onClick: onBuy, disabled: loading, children: t('payments.buyOneTime') }), _jsx("button", { type: "button", onClick: () => void onSubscribe('monthly'), disabled: loading, children: t('payments.subscribeMonthly') }), _jsx("button", { type: "button", onClick: () => void onSubscribe('yearly'), disabled: loading, children: t('payments.subscribeYearly') }), _jsx("button", { type: "button", onClick: () => void onRefreshStatus(), disabled: syncingStatus || !lastOrderId, children: t('payments.refreshStatus') }), _jsx("button", { type: "button", onClick: () => void onRefreshSubscription(), disabled: syncingStatus || !lastSubscriptionId, children: t('payments.refreshSubscriptionStatus') })] }), lastOrderId ? (_jsxs("p", { children: [t('payments.lastOrder'), ": ", _jsx("code", { children: lastOrderId }), _jsx("br", {}), t('payments.currentStatus'), ": ", _jsx("strong", { children: lastStatus ?? t('payments.unknown') })] })) : null, lastSubscriptionId ? (_jsxs("p", { children: [t('payments.lastSubscription'), ": ", _jsx("code", { children: lastSubscriptionId }), _jsx("br", {}), t('payments.currentSubscriptionStatus'), ": ", _jsx("strong", { children: lastSubscriptionStatus ?? t('payments.unknown') })] })) : null, message ? _jsx("p", { style: { color: 'green' }, children: message }) : null, error ? _jsx("p", { style: { color: 'crimson' }, children: error }) : null] }));
};
