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
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

  const variants = {
    primary:   "bg-primary text-white hover:bg-primary/90 focus:ring-primary/50 shadow-sm",
    outline:   "bg-white border border-gray-200 text-secondary hover:bg-gray-50 focus:ring-gray-200",
    secondary: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 focus:ring-slate-400",
    danger:    "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm shadow-red-100",
    ghost:     "text-gray-500 hover:bg-gray-100 hover:text-secondary focus:ring-gray-200",
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
