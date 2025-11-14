import toast from 'react-hot-toast';

export const showSuccess = (message) => {
  toast.success(message);
};

export const showError = (message) => {
  toast.error(message);
};

export const showInfo = (message) => {
  toast(message, {
    icon: 'ℹ️',
  });
};

export const showWarning = (message) => {
  toast(message, {
    icon: '⚠️',
    style: {
      background: 'rgba(245, 158, 11, 0.1)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      color: '#f59e0b'
    }
  });
};

export const showLoading = (message) => {
  return toast.loading(message);
};

export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};