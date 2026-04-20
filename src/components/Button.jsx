const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
  ...rest
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded font-bold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:   "bg-primary text-white hover:bg-primary-dark focus:ring-primary",
    secondary: "bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary",
    ghost:     "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400",
    danger:    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] ?? variants.primary} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
