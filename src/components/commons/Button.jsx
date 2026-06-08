export const Button = ({
  variant = "primary",
  children,
  type = "button",
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500",
    secondary:
      "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-gray-300",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
