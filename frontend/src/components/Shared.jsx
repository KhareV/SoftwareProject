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
    "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden";

  const variants = {
    primary:
      "bg-gradient-to-r from-primary-600 via-secondary-500 to-accent hover:from-primary-700 hover:via-secondary-600 hover:to-accent-dark text-white shadow-glow hover:shadow-glow-lg",
    secondary:
      "bg-dark-300 hover:bg-dark-200 text-light-100 border border-primary/20 hover:border-primary/40 shadow-lg",
    outline:
      "border-2 border-primary hover:bg-primary/10 text-primary hover:shadow-glow",
    danger:
      "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg",
    ghost: "hover:bg-dark-300 text-light-100 hover:shadow-md",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
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
      whileHover={hover ? { y: -6, scale: 1.01 } : {}}
      onClick={onClick}
      className={`glass-card rounded-xl p-6 border border-primary/10 ${
        hover ? "cursor-pointer hover-lift hover-glow" : ""
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
    primary: "text-primary-400",
    secondary: "text-secondary-400",
    success: "text-green-400",
    danger: "text-red-400",
    warning: "text-yellow-400",
  };

  const bgClasses = {
    primary: "from-primary-600/20 to-primary-800/20",
    secondary: "from-secondary-600/20 to-secondary-800/20",
    success: "from-green-600/20 to-green-800/20",
    danger: "from-red-600/20 to-red-800/20",
    warning: "from-yellow-600/20 to-yellow-800/20",
  };

  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-light-300 text-sm mb-2 font-medium">{label}</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-light-100 to-light-200 bg-clip-text text-transparent mb-1">
            {value}
          </p>
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-semibold ${
                  trend > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
              </span>
              <span className="text-light-300 text-xs ml-2">
                vs last period
              </span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${bgClasses[color]} border border-${color}/20 pulse-glow`}
        >
          <Icon className={`w-7 h-7 ${colorClasses[color]}`} />
        </div>
      </div>
    </Card>
  );
};

// ========== LOADING ==========

export const Loading = ({
  text = "Loading...",
  fullScreen = false,
  variant = "spinner",
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center">
      {variant === "spinner" ? (
        <div className="spinner w-14 h-14 mb-6"></div>
      ) : (
        <div className="loader-dots mb-6">
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
      <p className="text-light-200 font-medium text-lg">{text}</p>
      {fullScreen && <div className="progress-bar w-64 mt-4"></div>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-100/95 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="glass-card rounded-2xl p-12 border border-primary/10">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16">{content}</div>
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className={`glass-card rounded-2xl p-8 w-full ${sizes[size]} max-h-[90vh] overflow-y-auto border border-primary/20 shadow-glow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-light-100 to-light-200 bg-clip-text text-transparent">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-light-300 hover:text-light-100 hover:bg-dark-300/50 rounded-xl transition-all hover:rotate-90"
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
        <div className="text-light-200">{children}</div>
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
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-300 group-focus-within:text-primary-400 transition-colors">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          className={`
            w-full bg-dark-300/50 border border-primary/10 rounded-xl
            px-4 py-3 ${Icon ? "pl-11" : ""} text-light-100
            placeholder-light-300/50 transition-all duration-300
            focus:bg-dark-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:shadow-glow
            hover:border-primary/20
            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : ""
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-red-400 text-sm mt-2 flex items-center">
          <span className="inline-block w-1 h-1 rounded-full bg-red-400 mr-2"></span>
          {error}
        </p>
      )}
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
          w-full bg-dark-300/50 border border-primary/10 rounded-xl
          px-4 py-3 text-light-100 placeholder-light-300/50
          transition-all duration-300 resize-none
          focus:bg-dark-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:shadow-glow
          hover:border-primary/20
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : ""
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-red-400 text-sm mt-2 flex items-center">
          <span className="inline-block w-1 h-1 rounded-full bg-red-400 mr-2"></span>
          {error}
        </p>
      )}
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
    <div className="mb-4 relative z-50">
      {label && (
        <label className="block text-light-100 text-sm font-semibold mb-2">
          {label}
        </label>
      )}
      <select
        className={`
          w-full bg-dark-300 border border-light-200/10 rounded-lg
          px-4 py-3 text-light-100 transition-all cursor-pointer
          focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
          hover:border-primary/30 hover:bg-dark-200
          relative z-50 appearance-none
          ${error ? "border-red-500" : ""}
          ${className}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238B5CF6' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: "right 0.5rem center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "1.5em 1.5em",
          paddingRight: "2.5rem",
        }}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-dark-300 text-light-100 py-2"
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
