import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card } from '@starter/ui';
export const HomePage = () => {
    const { t, i18n } = useTranslation();
    return (_jsx("main", { style: { maxWidth: 960, margin: '2rem auto', padding: '1rem' }, children: _jsxs(Card, { title: t('home.title'), children: [_jsx("p", { children: t('home.subtitle') }), _jsx("button", { type: "button", onClick: () => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es'), children: t('home.switchLanguage') }), _jsxs("p", { children: [_jsx(Link, { to: "/register", children: "Registro" }), " | ", _jsx(Link, { to: "/login", children: "Login" }), " | ", _jsx(Link, { to: "/dashboard", children: "Panel" })] })] }) }));
};
