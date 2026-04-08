export const Input = ({ label, id, className = "", ...props }) => {
  return (
    <div className="w-full text-left">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all sm:text-sm ${className}`}
        {...props}
      />
    </div>
  );
};
