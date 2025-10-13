import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// ========== BUTTON ==========

export const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  icon: Icon,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-lg hover:shadow-xl",
    secondary:
      "bg-dark-300 hover:bg-dark-200 text-light-100 border border-light-200/10",
    outline: "border-2 border-primary hover:bg-primary/10 text-primary",
    danger: "bg-severity-critical hover:bg-red-700 text-white",
    ghost: "hover:bg-dark-300 text-light-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5 mr-2" />}
          {children}
        </>
      )}
    </motion.button>
  );
};

// ========== CARD ==========

export const Card = ({ children, className = "", hover = false, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4 } : {}}
      onClick={onClick}
      className={`glass rounded-xl p-6 ${
        hover ? "cursor-pointer hover-lift" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};

// ========== STATS CARD ==========

export const StatsCard = ({
  icon: Icon,
  label,
  value,
  trend,
  color = "primary",
}) => {
  const colorClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    success: "text-green-500",
    danger: "text-red-500",
    warning: "text-yellow-500",
  };

  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-light-200 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold text-light-100">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm ${
                  trend > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
              </span>
              <span className="text-light-200 text-sm ml-2">
                vs last period
              </span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-lg bg-gradient-to-br from-${color} to-${color}-dark bg-opacity-10`}
        >
          <Icon className={`w-6 h-6 ${colorClasses[color]}`} />
        </div>
      </div>
    </Card>
  );
};

// ========== LOADING ==========

export const Loading = ({ text = "Loading...", fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center">
      <div className="spinner w-12 h-12 mb-4"></div>
      <p className="text-light-200">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-100 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">{content}</div>
  );
};

// ========== BADGE ==========

export const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-primary/20 text-primary border-primary/30",
    success: "bg-green-500/20 text-green-300 border-green-500/30",
    warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    danger: "bg-red-500/20 text-red-300 border-red-500/30",
    info: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  };

  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// ========== MODAL ==========

export const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`glass rounded-2xl p-6 w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-light-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-light-200 hover:text-light-100 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
};

// ========== INPUT ==========

export const Input = ({
  label,
  error,
  icon: Icon,
  className = "",
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-light-100 text-sm font-semibold mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-200">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          className={`
            w-full bg-dark-300 border border-light-200/10 rounded-lg
            px-4 py-3 ${Icon ? "pl-11" : ""} text-light-100
            placeholder-light-200/50 transition-all
            focus:border-primary focus:ring-2 focus:ring-primary/20
            ${error ? "border-red-500" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
};

// ========== TEXTAREA ==========

export const Textarea = ({ label, error, className = "", ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-light-100 text-sm font-semibold mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full bg-dark-300 border border-light-200/10 rounded-lg
          px-4 py-3 text-light-100 placeholder-light-200/50
          transition-all resize-none
          focus:border-primary focus:ring-2 focus:ring-primary/20
          ${error ? "border-red-500" : ""}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
};

// ========== SELECT ==========

export const Select = ({
  label,
  options = [],
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-light-100 text-sm font-semibold mb-2">
          {label}
        </label>
      )}
      <select
        className={`
          w-full bg-dark-300 border border-light-200/10 rounded-lg
          px-4 py-3 text-light-100 transition-all
          focus:border-primary focus:ring-2 focus:ring-primary/20
          ${error ? "border-red-500" : ""}
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-dark-300"
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
};

// ========== EMPTY STATE ==========

export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {Icon && (
        <div className="mb-4 p-4 rounded-full bg-dark-300">
          <Icon className="w-12 h-12 text-light-200" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-light-100 mb-2">{title}</h3>
      <p className="text-light-200 text-center mb-6 max-w-md">{description}</p>
      {action}
    </div>
  );
};

// ========== TOOLTIP ==========

export const Tooltip = ({ children, content, position = "top" }) => {
  const [visible, setVisible] = React.useState(false);

  const positions = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`absolute ${positions[position]} z-50 px-3 py-2 text-sm bg-dark-300 text-light-100 rounded-lg shadow-lg whitespace-nowrap`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
