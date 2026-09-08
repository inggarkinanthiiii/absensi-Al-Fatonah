import { useCallback } from 'react';
import { toast } from 'react-toastify';

export const useNotification = () => {
    const showSuccess = useCallback((message) => {
        toast.success(message, {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            style: {
                background: '#ffffff',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '8px',
            },
        });
    }, []);

    const showError = useCallback((message) => {
        toast.error(message, {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            style: {
                background: '#ffffff',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '8px',
            },
        });
    }, []);

    const showInfo = useCallback((message) => {
        toast.info(message, {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            style: {
                background: '#ffffff',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '8px',
            },
        });
    }, []);

    return { showSuccess, showError, showInfo };
};

export default useNotification;
