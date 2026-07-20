export const Button = ({
  variant = "primary",
  children,
  type = "button",
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "px-4 py-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-[#1c1c28] text-white hover:bg-[#2a2a3a] focus:ring-[#059669] shadow-sm hover:shadow-md",
    secondary:
      "bg-white text-[#1c1c28] border border-[#e8e3dd] hover:bg-[#faf8f5] hover:border-[#d4cdc4] focus:ring-[#c78b4a]",
    ghost:
      "text-[#059669] hover:bg-[#ecfdf5] focus:ring-[#059669]",
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
