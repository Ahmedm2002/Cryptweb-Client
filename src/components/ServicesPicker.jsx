import React from "react";
import { FileText, Mic, Video } from "lucide-react";

const ServiceCard = ({ icon: Icon, title, onClick, comingSoon, disabled }) => (
  <button
    onClick={disabled ? undefined : onClick}
    className={`group flex flex-col items-center gap-3 transition-opacity duration-300 relative ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
  >
    {comingSoon && (
      <span className="absolute -top-2 -right-2 z-10 bg-indigo-600 text-white text-[10px] font-bold uppercase py-1 px-2 rounded-lg shadow-lg shadow-indigo-100">
        Upcoming
      </span>
    )}
    <div
      className={`w-24 h-24 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center transition-all ${!disabled ? "group-hover:bg-gray-100 group-active:scale-95" : ""}`}
    >
      <Icon
        className={`w-10 h-10 ${disabled ? "text-gray-300" : "text-gray-400 group-hover:text-gray-600"} transition-colors`}
      />
    </div>

    <div className="flex flex-col items-center gap-0.5">
      <span
        className={`font-medium text-sm ${disabled ? "text-gray-400" : "text-gray-900"}`}
      >
        {title}
      </span>
    </div>
  </button>
);

const ServicesPicker = ({ onSelectService }) => {
  const services = [
    {
      id: "audio",
      title: "Audio Call",
      icon: Mic,
      comingSoon: true,
      disabled: true,
    },
    {
      id: "file",
      title: "Send File",
      icon: FileText,
      comingSoon: false,
      disabled: false,
    },
    {
      id: "video",
      title: "Video Call",
      icon: Video,
      comingSoon: true,
      disabled: true,
    },
  ];

  return (
    <div
      id="services-picker"
      className="w-full max-w-2xl mx-auto py-8 px-4 animate-in fade-in duration-500"
    >
      <div className="flex justify-center flex-wrap items-center gap-8 sm:gap-16">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            {...service}
            onClick={() => onSelectService(service.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ServicesPicker;
