import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Card = ({ title, children }) => {
    return (_jsxs("section", { style: {
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: '1rem',
            boxShadow: '0 6px 20px rgba(0,0,0,0.05)'
        }, children: [_jsx("h1", { children: title }), children] }));
};
