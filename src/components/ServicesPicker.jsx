import React from "react";
import { FileText, Mic, Video } from "lucide-react";

const ServiceCard = ({ icon: Icon, title, onClick, comingSoon }) => (
  <button
    onClick={onClick}
    className="group flex flex-col items-center gap-3 transition-opacity duration-300"
  >
    <div className="w-24 h-24 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-gray-100 group-active:scale-95 transition-all">
      <Icon className="w-10 h-10 text-gray-400 group-hover:text-gray-600 transition-colors" />
    </div>

    <div className="flex flex-col items-center gap-0.5">
      <span className="text-gray-900 font-medium text-sm">{title}</span>
      {comingSoon && (
        <span className="text-[10px] font-bold uppercase tracking-tight text-gray-400">
          Coming Soon
        </span>
      )}
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
    },
    {
      id: "file",
      title: "Send File",
      icon: FileText,
      comingSoon: false,
    },
    {
      id: "video",
      title: "Video Call",
      icon: Video,
      comingSoon: true,
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
