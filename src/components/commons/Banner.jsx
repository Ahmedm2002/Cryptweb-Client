import { Button } from "./Button";

export const Banner = ({ text, buttonText, onClick }) => {
  return (
    <div className="bg-gray-100 border-l-4 border-gray-900 p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-r-md">
      <p className="text-gray-800 font-medium mb-3 sm:mb-0">{text}</p>
      {buttonText && onClick && (
        <Button variant="secondary" onClick={onClick} className="text-sm">
          {buttonText}
        </Button>
      )}
    </div>
  );
};
