const IncomingRequest = ({ request, onRespond }) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <div className="text-center">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Connection Request
          </h3>
          <p className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">
              {request.fromName || request.from}
            </span>{" "}
            wants to connect
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => onRespond(request.from, false)}
              className="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={() => onRespond(request.from, true)}
              className="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-white bg-[#1c1c28] hover:bg-[#2a2a3a] transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingRequest;
