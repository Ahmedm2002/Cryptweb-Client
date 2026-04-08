export const Button = ({
  variant = "primary",
  children,
  type = "button",
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "px-5 py-2.5 rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-600 shadow-sm hover:shadow-md",
    secondary:
      "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 focus:ring-gray-200 shadow-sm hover:shadow",
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
