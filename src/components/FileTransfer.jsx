import { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  File,
  ShieldCheck,
  Zap,
  X,
  Download,
  LoaderCircle,
} from "lucide-react";
import { rtcConnection } from "./configs/webrtc.config";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";

const FileTransfer = ({ friendEmail, status }) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferSpeed, setTransferSpeed] = useState(0);
  const [incomingFile, setIncomingFile] = useState(null);
  const incomingFileRef = useRef(null);
  const receivedChunksRef = useRef([]);
  const [totalReceivedSize, setTotalReceivedSize] = useState(0);

  const fileInputRef = useRef(null);
  const dataChannelRef = useRef(null);
  const startTimeRef = useRef(null);

  const setupChannel = (channel) => {
    console.log("Setting up data channel:", channel.label);
    channel.binaryType = "arraybuffer";
    dataChannelRef.current = channel;

    const onOpen = () => console.log("Data channel is OPEN");
    const onClose = () => {
      console.log("Data channel is CLOSED");
      setIsTransferring(false);
    };

    const onMessage = (event) => {
      if (typeof event.data === "string") {
        try {
          const metadata = JSON.parse(event.data);
          if (metadata.type === "metadata") {
            console.log("Received file metadata:", metadata);
            setIncomingFile(metadata);
            incomingFileRef.current = metadata;
            receivedChunksRef.current = [];
            setTotalReceivedSize(0);
            setTransferProgress(0);
            setIsTransferring(true);
            startTimeRef.current = Date.now();
          } else if (metadata.type === "complete") {
            console.log("Received complete signal");
            setIsTransferring(false);
          }
        } catch (e) {
          console.log("Received non-JSON string message:", event.data);
        }
      } else {
        // Binary data chunk
        const chunk = event.data;
        receivedChunksRef.current.push(chunk);
        
        setTotalReceivedSize(prev => {
          const newSize = prev + chunk.byteLength;
          const currentMetadata = incomingFileRef.current;
          
          if (currentMetadata) {
            const progress = Math.round((newSize / currentMetadata.size) * 100);
            setTransferProgress(progress);

            // Calculate speed
            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            if (elapsed > 0) {
              setTransferSpeed(newSize / elapsed / 1024 / 1024); // MB/s
            }

            // Fallback: If we have all bytes, stop transferring even if "complete" signal is delayed
            if (newSize >= currentMetadata.size) {
              setIsTransferring(false);
            }
          }
          return newSize;
        });
      }
    };

    channel.addEventListener("open", onOpen);
    channel.addEventListener("close", onClose);
    channel.addEventListener("message", onMessage);

    return () => {
      channel.removeEventListener("open", onOpen);
      channel.removeEventListener("close", onClose);
      channel.removeEventListener("message", onMessage);
    };
  };

  useEffect(() => {
    let cleanup = null;
    // Setup data channel listeners
    const handleDataChannel = (event) => {
      const channel = event.channel;
      console.log("Incoming data channel event:", channel.label);
      cleanup = setupChannel(channel);
    };

    rtcConnection.addEventListener("datachannel", handleDataChannel);

    return () => {
      rtcConnection.removeEventListener("datachannel", handleDataChannel);
      if (cleanup) cleanup();
    };
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setTransferProgress(0);
    setIsTransferring(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendSecuredFile = async () => {
    if (!selectedFile || !friendEmail) return;

    // We need the data channel. If it's not set up, try to create it if we are the initiator.
    if (!dataChannelRef.current) {
      console.log("No data channel ref, creating one...");
      const channel = rtcConnection.createDataChannel("channel:file-transfer");
      setupChannel(channel);
    }

    const channel = dataChannelRef.current;
    if (channel.readyState !== "open") {
      console.log("Waiting for data channel to open...");
      channel.onopen = () => {
        console.log("Data channel opened, starting transfer...");
        startTransfer(channel);
      };
      return;
    }

    startTransfer(channel);
  };

  const startTransfer = async (channel) => {
    setIsTransferring(true);
    setTransferProgress(0);
    startTimeRef.current = Date.now();

    // Send metadata
    const metadata = {
      type: "metadata",
      name: selectedFile.name,
      size: selectedFile.size,
      mimeType: selectedFile.type,
      senderEmail: user.email,
    };
    channel.send(JSON.stringify(metadata));

    const CHUNK_SIZE = 16384; // 16KB
    const reader = new FileReader();
    let offset = 0;

    const readSlice = (o) => {
      const slice = selectedFile.slice(offset, o + CHUNK_SIZE);
      reader.readAsArrayBuffer(slice);
    };

    reader.onload = (e) => {
      const buffer = e.target.result;
      channel.send(buffer);
      offset += buffer.byteLength;

      const progress = Math.round((offset / selectedFile.size) * 100);
      setTransferProgress(progress);

      // Calculate speed
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      if (elapsed > 0) {
        setTransferSpeed(offset / elapsed / 1024 / 1024);
      }

      if (offset < selectedFile.size) {
        // High water mark check to avoid buffer overflow
        if (channel.bufferedAmount > channel.bufferedAmountLowThreshold) {
          channel.onbufferedamountlow = () => {
            channel.onbufferedamountlow = null;
            readSlice(offset);
          };
        } else {
          readSlice(offset);
        }
      } else {
        console.log("File sent completely");
        channel.send(JSON.stringify({ type: "complete" }));
        setIsTransferring(false);
        saveTransferRecord();
      }
    };

    readSlice(0);
  };

  const saveTransferRecord = async () => {
    try {
      const timeElapsed = (Date.now() - startTimeRef.current) / 1000;
      await api.post("/file-transfers/complete", {
        senderEmail: user.email,
        receiverEmail: friendEmail,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        timeElapsed: Math.round(timeElapsed),
        transferType: "P2P",
      });
      console.log("Transfer record saved to DB");
    } catch (error) {
      console.error("Failed to save transfer record:", error);
    }
  };

  const downloadFile = () => {
    if (!incomingFile || receivedChunksRef.current.length === 0) return;
    const blob = new Blob(receivedChunksRef.current, { type: incomingFile.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = incomingFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Clear incoming file state
    setIncomingFile(null);
    incomingFileRef.current = null;
    receivedChunksRef.current = [];
    setTotalReceivedSize(0);
    setTransferProgress(0);
  };

  if (!friendEmail) {
    return (
      <div className="bg-white rounded-[2.5rem] p-12 border border-gray-100 shadow-2xl flex flex-col items-center justify-center min-h-[400px] text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
          <UploadCloud className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2 font-display">
          File Transfer
        </h3>
        <p className="text-gray-500">
          Connect to a friend to start secure sharing.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-4 sm:p-8 flex flex-col h-full overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Zap className="w-32 h-32 text-indigo-600" />
        </div>

        {/* Incoming File Notification */}
        {incomingFile &&
          !isTransferring &&
          totalReceivedSize > 0 &&
          totalReceivedSize >= incomingFile.size && (
            <div className="mb-6 p-6 bg-green-50 rounded-3xl border border-green-100 flex items-center justify-between animate-in slide-in-from-top-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white">
                  <File className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-green-900">
                    {incomingFile.name} received!
                  </p>
                  <p className="text-sm text-green-700">
                    {(incomingFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={downloadFile}
                className="px-6 py-2 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          )}

        <div
          className={`flex-1 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center p-8 sm:p-16 transition-all duration-500 min-h-[350px] cursor-pointer group ${
            isDragging
              ? "border-indigo-400 bg-indigo-50/50 scale-[0.99] shadow-inner"
              : "border-gray-200 bg-gray-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-xl"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isTransferring && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {isTransferring ? (
            <div className="flex flex-col items-center text-center w-full max-w-md">
              <div className="relative w-32 h-32 mb-8">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="8"
                    strokeDasharray={`${transferProgress * 2.827} 282.7`}
                    strokeLinecap="round"
                    className="transition-all duration-300 transform -rotate-90 origin-center"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-gray-900">
                    {transferProgress}%
                  </span>
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                {incomingFile ? "Receiving..." : "Sending..."}
              </h4>
              <p className="text-gray-500 font-medium">
                {transferSpeed.toFixed(2)} MB/s •{" "}
                {incomingFile ? incomingFile.name : selectedFile.name}
              </p>
            </div>
          ) : selectedFile ? (
            <div className="flex flex-col items-center text-center animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-200">
                <File className="w-10 h-10 text-white" />
              </div>
              <p className="text-xl font-bold text-gray-900 truncate max-w-[300px] mb-1">
                {selectedFile.name}
              </p>
              <p className="text-sm font-medium text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to
                send
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="mt-8 text-sm text-red-500 hover:text-white font-bold px-6 py-2 border border-red-100 hover:bg-red-500 rounded-full transition-all duration-300"
              >
                Cancel Selection
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <UploadCloud className="w-10 h-10 text-indigo-500" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                Drag & drop files here
              </h4>
              <p className="text-gray-500 max-w-xs leading-relaxed">
                Securely send any file directly from your browser to your
                contact.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <div className="h-px w-8 bg-gray-200" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  or
                </span>
                <div className="h-px w-8 bg-gray-200" />
              </div>
              <button className="mt-6 px-8 py-3 bg-white border border-gray-200 text-indigo-600 rounded-2xl font-bold text-sm hover:border-indigo-600 hover:bg-indigo-50 transition-all active:scale-95 shadow-sm">
                Browse Files
              </button>
            </div>
          )}
        </div>

        {!isTransferring && (
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-6">
            <button
              onClick={sendSecuredFile}
              disabled={!selectedFile || !status?.isOnline}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-[1.25rem] font-bold text-lg shadow-xl shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:grayscale disabled:hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-current" />
              Send Secured File
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileTransfer;
