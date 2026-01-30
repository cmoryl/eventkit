import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-[200] flex items-center px-4 py-3 rounded-lg shadow-2xl transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${
        type === 'success' ? 'bg-green-600/90 border border-green-500' : 'bg-red-600/90 border border-red-500'
      }`}
    >
      <div className={`mr-3 p-1 rounded-full ${type === 'success' ? 'bg-green-800' : 'bg-red-800'}`}>
        {type === 'success' ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>
      <span className="text-sm font-medium text-white">{message}</span>
    </div>
  );
};

export default Toast;
