import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({
    message,
    type = 'success',
    isVisible,
    onClose,
    duration = 3000,
}) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return '#28a745';
            case 'error':
                return '#dc3545';
            case 'info':
            default:
                return '#17a2b8';
        }
    };

    return (
        <div style={{ ...toastStyle, backgroundColor: getBackgroundColor() }}>
            <span>{message}</span>
            <button onClick={onClose} style={closeButtonStyle}>&times;</button>
        </div>
    );
};

const toastStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 24px',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1200,
    animation: 'slideUp 0.3s ease',
};

const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0',
    lineHeight: 1,
    opacity: 0.8,
};

export default Toast;
