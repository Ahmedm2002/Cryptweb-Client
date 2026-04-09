import { Video } from "lucide-react";

const VideoCall = () => {
  return (
    <div className="w-full max-w-2xl mx-auto py-12 animate-in fade-in duration-500">
      <div className="bg-gray-50 rounded-3xl p-12 flex flex-col items-center justify-center text-center border border-gray-100">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <Video className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Video Call</h3>
        <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">
          Seamless peer-to-peer video streaming infrastructure is coming soon.
        </p>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
          In Development
        </span>
      </div>
    </div>
  );
};

export default VideoCall;
