const IncomingRequest = ({ request, onRespond }) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Connection Request
          </h3>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-800">
              {request.fromName || request.from}
            </span> wants to connect
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => onRespond(request.from, false)}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={() => onRespond(request.from, true)}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
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
