import { useEffect, useState } from "react";
import { useSocket, socket } from "../hooks/useSocket";
import EmailInput from "../components/EmailInput";
import StatusBar from "../components/StatusBar";
import { useAuth } from "../hooks/useAuth";

// Modular Components
import VerificationBanner from "../components/dashboard/VerificationBanner";
import IncomingRequest from "../components/dashboard/ConnectionStatus/IncomingRequest";
import PendingStatus from "../components/dashboard/ConnectionStatus/PendingStatus";
import DeclinedStatus from "../components/dashboard/ConnectionStatus/DeclinedStatus";
import AcceptedStatus from "../components/dashboard/ConnectionStatus/AcceptedStatus";

export const Home = () => {
  const { user } = useAuth();
  const {
    isConnected,
    friendStatus,
    incomingRequest,
    requestStatus,
    sendConnectionRequest,
    respondToRequest,
  } = useSocket();
  const [friendEmail, setFriendEmail] = useState("");
  const [showCards, setShowCards] = useState(false);
  const [activeService, setActiveService] = useState(null);

  useEffect(() => {
    if (requestStatus === "accepted") {
      setShowCards(true);
    } else if (requestStatus === "declined") {
      setShowCards(false);
    }
  }, [requestStatus]);

  const handleConnect = (email) => {
    setFriendEmail(email);
    sendConnectionRequest(email);
  };

  const handleCancel = () => {
    setShowCards(false);
    setFriendEmail("");
    setActiveService(null);
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in duration-300 relative">
      {user && !user.verified_at && <VerificationBanner />}

      <IncomingRequest request={incomingRequest} onRespond={respondToRequest} />

      {!showCards ? (
        <div className="animate-in fade-in zoom-in duration-300 px-4">
          <EmailInput
            onConnect={handleConnect}
            disabled={!isConnected || requestStatus === "pending"}
          />

          {requestStatus === "pending" && (
            <PendingStatus
              friendName={friendStatus?.name}
              friendEmail={friendEmail}
            />
          )}

          {requestStatus === "declined" && (
            <DeclinedStatus
              friendName={friendStatus?.name}
              friendEmail={friendEmail}
            />
          )}

          {(friendEmail || friendStatus) && requestStatus === "idle" && (
            <div className="mt-8">
              <StatusBar
                isUserOnline={isConnected}
                friendStatus={friendStatus}
                friendEmail={friendEmail}
                userName={user?.name}
              />
            </div>
          )}
        </div>
      ) : (
        <AcceptedStatus
          isConnected={isConnected}
          friendStatus={friendStatus}
          friendEmail={friendEmail}
          user={user}
          activeService={activeService}
          setActiveService={setActiveService}
          onDisconnect={handleCancel}
        />
      )}
    </div>
  );
};
