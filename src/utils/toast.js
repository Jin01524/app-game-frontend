export const toast = {
  listeners: [],
  show: (message, type = 'info') => {
    toast.listeners.forEach(l => l(message, type));
  },
  success: (message) => toast.show(message, 'success'),
  error: (message) => toast.show(message, 'error'),
  warning: (message) => toast.show(message, 'warning'),
  info: (message) => toast.show(message, 'info'),
  subscribe: (listener) => {
    toast.listeners.push(listener);
    return () => {
      toast.listeners = toast.listeners.filter(l => l !== listener);
    };
  }
};

