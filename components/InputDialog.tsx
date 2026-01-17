import React, { useState, useEffect, useRef } from 'react';

interface InputDialogProps {
    isOpen: boolean;
    title: string;
    message?: string;
    placeholder?: string;
    defaultValue?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
}

const InputDialog: React.FC<InputDialogProps> = ({
    isOpen,
    title,
    message,
    placeholder = '',
    defaultValue = '',
    confirmText = 'Save',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
}) => {
    const [value, setValue] = useState(defaultValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setValue(defaultValue);
            // Focus input after a short delay to ensure dialog is rendered
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen, defaultValue]);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onConfirm(value.trim());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <div style={overlayStyle} onClick={handleOverlayClick}>
            <form style={dialogStyle} onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                <h3 style={titleStyle}>{title}</h3>
                {message && <p style={messageStyle}>{message}</p>}
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    style={inputStyle}
                />
                <div style={buttonContainerStyle}>
                    <button type="button" onClick={onCancel} style={cancelButtonStyle}>
                        {cancelText}
                    </button>
                    <button
                        type="submit"
                        style={{
                            ...confirmButtonStyle,
                            opacity: value.trim() ? 1 : 0.5,
                        }}
                        disabled={!value.trim()}
                    >
                        {confirmText}
                    </button>
                </div>
            </form>
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
    margin: '0 0 16px 0',
    color: '#6c757d',
    fontSize: '0.95rem',
    lineHeight: 1.5,
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '16px',
    boxSizing: 'border-box',
    marginBottom: '20px',
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
    backgroundColor: '#8A2BE2',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, opacity 0.2s ease',
};

export default InputDialog;
