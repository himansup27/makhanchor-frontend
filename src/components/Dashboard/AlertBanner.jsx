// src/components/Dashboard/AlertBanner.jsx
import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

const AlertBanner = ({
  type = 'info',
  title,
  message,
  messages = [],
  onClose,
  action,
  actionLabel,
}) => {
  const types = {
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      textColor: 'text-blue-800',
      buttonColor: 'text-blue-600 hover:text-blue-700',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      textColor: 'text-yellow-800',
      buttonColor: 'text-yellow-600 hover:text-yellow-700',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      textColor: 'text-red-800',
      buttonColor: 'text-red-600 hover:text-red-700',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      textColor: 'text-green-800',
      buttonColor: 'text-green-600 hover:text-green-700',
    },
  };

  const config = types[type] || types.info;
  const Icon = config.icon;

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border-l-4 rounded-lg p-4 animate-slide-in`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <Icon className={config.iconColor} size={20} />
        </div>

        {/* Content */}
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold ${config.titleColor} mb-1`}>
              {title}
            </h4>
          )}
          
          {message && (
            <p className={`text-sm ${config.textColor}`}>{message}</p>
          )}

          {messages.length > 0 && (
            <ul className={`text-sm ${config.textColor} mt-2 space-y-1`}>
              {messages.map((msg, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5">•</span>
                  <span>{msg}</span>
                </li>
              ))}
            </ul>
          )}

          {action && actionLabel && (
            <button
              onClick={action}
              className={`mt-3 text-sm font-medium ${config.buttonColor} transition-colors`}
            >
              {actionLabel} →
            </button>
          )}
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${config.iconColor} hover:opacity-70 transition-opacity`}
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertBanner;