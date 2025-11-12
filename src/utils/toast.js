import toast from 'react-hot-toast';

// Tema escuro customizado
const toastStyle = {
  background: '#1e293b',
  color: '#f8fafc',
  borderRadius: '8px',
  fontSize: '14px',
  padding: '12px 16px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
};

export const showSuccess = (message, options = {}) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      ...toastStyle,
      border: '1px solid #10b981'
    },
    iconTheme: {
      primary: '#10b981',
      secondary: '#f8fafc'
    },
    ...options
  });
};

export const showError = (message, options = {}) => {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      ...toastStyle,
      border: '1px solid #ef4444'
    },
    iconTheme: {
      primary: '#ef4444',
      secondary: '#f8fafc'
    },
    ...options
  });
};

export const showInfo = (message, options = {}) => {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    icon: 'ℹ️',
    style: {
      ...toastStyle,
      border: '1px solid #3b82f6'
    },
    ...options
  });
};

export const showWarning = (message, options = {}) => {
  toast(message, {
    duration: 3500,
    position: 'top-right',
    icon: '⚠️',
    style: {
      ...toastStyle,
      border: '1px solid #f59e0b'
    },
    ...options
  });
};

export const showLoading = (message) => {
  return toast.loading(message, {
    position: 'top-right',
    style: toastStyle
  });
};

export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

export const showPromise = (promise, messages) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Carregando...',
      success: messages.success || 'Sucesso!',
      error: messages.error || 'Erro ao processar'
    },
    {
      position: 'top-right',
      style: toastStyle,
      success: {
        duration: 3000,
        iconTheme: {
          primary: '#10b981',
          secondary: '#f8fafc'
        }
      },
      error: {
        duration: 4000,
        iconTheme: {
          primary: '#ef4444',
          secondary: '#f8fafc'
        }
      }
    }
  );
};