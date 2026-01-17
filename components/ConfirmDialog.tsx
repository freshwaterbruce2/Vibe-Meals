import React from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'default';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'default'
}) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    return (
        <div style={overlayStyle} onClick={handleOverlayClick}>
            <div style={dialogStyle}>
                <h3 style={titleStyle}>{title}</h3>
                <p style={messageStyle}>{message}</p>
                <div style={buttonContainerStyle}>
                    <button onClick={onCancel} style={cancelButtonStyle}>
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            ...confirmButtonStyle,
                            backgroundColor: variant === 'danger' ? '#dc3545' : '#8A2BE2'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100,
};

const dialogStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
};

const titleStyle: React.CSSProperties = {
    margin: '0 0 12px 0',
    color: '#4a4a4a',
    fontSize: '1.25rem',
};

const messageStyle: React.CSSProperties = {
    margin: '0 0 24px 0',
    color: '#6c757d',
    fontSize: '1rem',
    lineHeight: 1.5,
};

const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
};

const cancelButtonStyle: React.CSSProperties = {
    padding: '10px 20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#4a4a4a',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
};

const confirmButtonStyle: React.CSSProperties = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
};

export default ConfirmDialog;
