// components/common/CameraCaptureModal.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { FiCamera, FiX, FiRefreshCw, FiAlertCircle, FiCheck, FiRepeat } from "react-icons/fi";

const CameraCaptureModal = ({
  isOpen,
  onClose,
  onCapture,
  onFallbackToFile,
  title = "Take Product Photo",
}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stable references to callback props
  const onCaptureRef = useRef(onCapture);
  const onCloseRef = useRef(onClose);
  const onFallbackRef = useRef(onFallbackToFile);
  useEffect(() => { onCaptureRef.current = onCapture; }, [onCapture]);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { onFallbackRef.current = onFallbackToFile; }, [onFallbackToFile]);

  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.error("Error stopping camera stream:", err);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(
    async (deviceId) => {
      setError("");
      setLoading(true);
      setCapturedBlob(null);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return "";
      });

      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setError(
          "Camera access is not supported by your browser or requires HTTPS. You can select an image file instead.",
        );
        setLoading(false);
        return;
      }

      stopStream();

      try {
        // Enumerate video input devices
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(
          (d) => d.kind === "videoinput",
        );
        setDevices(videoDevices);

        const constraints = {
          video: deviceId
            ? { deviceId: { exact: deviceId } }
            : {
                facingMode: { ideal: "environment" },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        // Set device id if not selected yet
        const activeTrack = stream.getVideoTracks()[0];
        const settings = activeTrack?.getSettings?.();
        if (settings?.deviceId && !deviceId) {
          setSelectedDeviceId(settings.deviceId);
        }

        setLoading(false);
      } catch (err) {
        console.error("Camera capture initialization failed:", err);
        stopStream();
        setLoading(false);

        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError(
            "Camera permission was denied. Please allow camera access in your browser settings or select an existing image file.",
          );
        } else if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          setError("No camera was found on your device. You can choose an image file instead.");
        } else if (
          err.name === "NotReadableError" ||
          err.name === "TrackStartError"
        ) {
          setError("The camera is currently in use by another program.");
        } else {
          setError(
            err.message ||
              "Could not access the camera. You can choose an image file instead.",
          );
        }
      }
    },
    [stopStream],  // Only depends on stopStream (stable)
  );

  // Open/close lifecycle
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startCamera(selectedDeviceId);
    } else {
      stopStream();
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return "";
      });
      setCapturedBlob(null);
    }

    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return "";
      });
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current) {
      setError("Camera is not ready. Please try again.");
      return;
    }
    const video = videoRef.current;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    if (width <= 0 || height <= 0) {
      setError("Camera stream is not ready. Please wait a moment and try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob || blob.size === 0) {
          setError("Failed to capture image. The photo appears to be empty. Please try again.");
          return;
        }
        const objectUrl = URL.createObjectURL(blob);
        setCapturedBlob(blob);
        setPreviewUrl(objectUrl);
        stopStream();
      },
      "image/jpeg",
      0.92,
    );
  };

  const handleRetake = () => {
    startCamera(selectedDeviceId);
  };

  const handleUsePhoto = () => {
    if (!capturedBlob) return;

    // Convert blob to standard File object with timestamped name
    const filename = `photo-${Date.now()}.jpg`;
    const file = new File([capturedBlob], filename, { type: "image/jpeg" });

    // Validate size limit (3 MB)
    if (file.size > 3 * 1024 * 1024) {
      setError("Captured image is larger than 3 MB. Please retake.");
      return;
    }

    if (file.size === 0) {
      setError("Captured image is empty. Please retake the photo.");
      return;
    }

    onCaptureRef.current(file, previewUrl);
    onCloseRef.current();
  };

  const handleDeviceChange = (e) => {
    const newDeviceId = e.target.value;
    setSelectedDeviceId(newDeviceId);
    startCamera(newDeviceId);
  };

  const handleFallback = () => {
    onCloseRef.current();
    if (onFallbackRef.current) {
      onFallbackRef.current();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-semibold">
              <FiCamera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
              <p className="text-xs text-gray-500">
                {previewUrl ? "Review captured photo" : "Position product in center"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            aria-label="Close camera"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Selector (if multiple cameras available and in live mode) */}
        {!previewUrl && devices.length > 1 && (
          <div className="px-6 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2 text-xs">
            <label htmlFor="capture-camera-select" className="text-gray-600 font-medium whitespace-nowrap">
              Camera:
            </label>
            <select
              id="capture-camera-select"
              value={selectedDeviceId}
              onChange={handleDeviceChange}
              className="flex-1 py-1 px-2 border border-gray-200 rounded-md bg-white text-gray-700 outline-none focus:ring-1 focus:ring-purple-500 text-xs"
            >
              {devices.map((device, index) => (
                <option key={device.deviceId || index} value={device.deviceId}>
                  {device.label || `Camera ${index + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Viewfinder / Preview Area */}
        <div className="relative bg-black aspect-[4/3] w-full flex items-center justify-center overflow-hidden">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Captured preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* Loading Indicator */}
          {loading && !error && !previewUrl && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white gap-3 z-10">
              <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-sm font-medium">Starting camera...</p>
            </div>
          )}

          {/* Error Message */}
          {error && !previewUrl && (
            <div className="absolute inset-0 bg-gray-900/95 flex flex-col items-center justify-center p-6 text-center text-white z-20">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-3">
                <FiAlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium mb-1 text-red-200">Camera Error</p>
              <p className="text-xs text-gray-300 max-w-sm mb-4 leading-relaxed">{error}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startCamera(selectedDeviceId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition"
                >
                  <FiRefreshCw className="w-3.5 h-3.5" /> Try Again
                </button>
                {onFallbackToFile && (
                  <button
                    type="button"
                    onClick={handleFallback}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition"
                  >
                    Choose Existing File
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Subtle Viewfinder Crosshairs in Live Mode */}
          {!error && !loading && !previewUrl && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 sm:w-60 sm:h-60 border border-white/30 rounded-2xl flex items-center justify-center">
                <div className="w-4 h-4 border-t border-l border-white/50 absolute top-2 left-2" />
                <div className="w-4 h-4 border-t border-r border-white/50 absolute top-2 right-2" />
                <div className="w-4 h-4 border-b border-l border-white/50 absolute bottom-2 left-2" />
                <div className="w-4 h-4 border-b border-r border-white/50 absolute bottom-2 right-2" />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          {previewUrl ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-xs"
              >
                <FiRepeat className="w-4 h-4" /> Retake Photo
              </button>
              <button
                type="button"
                onClick={handleUsePhoto}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition shadow-xs"
              >
                <FiCheck className="w-4 h-4" /> Use This Photo
              </button>
            </>
          ) : (
            <>
              {onFallbackToFile ? (
                <button
                  type="button"
                  onClick={handleFallback}
                  className="text-xs text-gray-500 hover:text-gray-800 underline font-medium"
                >
                  Choose file instead
                </button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCapture}
                  disabled={loading || Boolean(error)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition shadow-xs"
                >
                  <FiCamera className="w-4 h-4" /> Capture Photo
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCaptureModal;
