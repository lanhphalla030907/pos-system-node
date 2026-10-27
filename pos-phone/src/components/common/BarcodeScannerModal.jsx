// components/common/BarcodeScannerModal.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  MultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  BinaryBitmap,
  HybridBinarizer,
  RGBLuminanceSource,
  NotFoundException,
  ChecksumException,
  FormatException,
  ReaderException,
} from "@zxing/library";
import { FiCamera, FiX, FiRefreshCw, FiAlertCircle, FiCheck } from "react-icons/fi";

// Fix @zxing/library v0.23.0 bug: NotFoundException/ChecksumException/FormatException extend
// Exception instead of ReaderException, causing MultiFormatReader to log dozens of
// non-ReaderException warnings per second to the console and freezing the main thread.
if (typeof NotFoundException !== "undefined" && typeof ReaderException !== "undefined") {
  Object.setPrototypeOf(NotFoundException.prototype, ReaderException.prototype);
  Object.setPrototypeOf(ChecksumException.prototype, ReaderException.prototype);
  Object.setPrototypeOf(FormatException.prototype, ReaderException.prototype);
}

// Helper: convert RGBA ImageData to a grayscale Uint8ClampedArray for RGBLuminanceSource.
// Uses the standard YUV luminance formula: 0.299R + 0.587G + 0.114B
function rgbaToGrayscale(imageData) {
  const { data, width, height } = imageData;
  const size = width * height;
  const grayscale = new Uint8ClampedArray(size);
  for (let i = 0, j = 0; j < size; i += 4, j++) {
    const alpha = data[i + 3];
    if (alpha === 0) {
      grayscale[j] = 0xFF;
    } else {
      grayscale[j] = ((306 * data[i] + 601 * data[i + 1] + 117 * data[i + 2] + 0x200) >> 10) & 0xFF;
    }
  }
  return grayscale;
}


const SUPPORTED_ZXING_FORMATS = [
  BarcodeFormat.AZTEC,
  BarcodeFormat.CODABAR,
  BarcodeFormat.CODE_39,
  BarcodeFormat.CODE_93,
  BarcodeFormat.CODE_128,
  BarcodeFormat.DATA_MATRIX,
  BarcodeFormat.EAN_8,
  BarcodeFormat.EAN_13,
  BarcodeFormat.ITF,
  BarcodeFormat.MAXICODE,
  BarcodeFormat.PDF_417,
  BarcodeFormat.QR_CODE,
  BarcodeFormat.RSS_14,
  BarcodeFormat.RSS_EXPANDED,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.UPC_EAN_EXTENSION,
  BarcodeFormat.MICRO_QR_CODE,
];



const NATIVE_DETECTOR_FORMATS = [
  "ean_13",
  "ean_8",
  "upc_a",
  "upc_e",
  "code_128",
  "code_39",
  "itf",
  "qr_code",
];

// Diagnostic logging flag and helpers (rate-limited, controlled diagnostics)
const SCANNER_DEBUG = true;

const debugStats = {
  framesScanned: 0,
  noDetectCount: 0,
  checksumErrorCount: 0,
  formatErrorCount: 0,
  unknownErrorCount: 0,
  lastHeartbeatTime: 0,
  lastNotReadyLogTime: 0,
  lastNativeDetectError: null,
  lastZxingError: null,
};

function scanLog(stage, message, data) {
  if (!SCANNER_DEBUG) return;
  const prefix = `[BarcodeScanner][${stage}]`;
  if (data !== undefined) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

function scanWarn(stage, message, data) {
  if (!SCANNER_DEBUG) return;
  const prefix = `[BarcodeScanner][${stage}]`;
  if (data !== undefined) {
    console.warn(`${prefix} ${message}`, data);
  } else {
    console.warn(`${prefix} ${message}`);
  }
}

function scanError(stage, message, error) {
  if (!SCANNER_DEBUG) return;
  const prefix = `[BarcodeScanner][${stage}]`;
  if (error !== undefined) {
    console.error(`${prefix} ${message}`, error);
  } else {
    console.error(`${prefix} ${message}`);
  }
}

// Play clear audio feedback chime upon barcode detection
function playSuccessSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(1050, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // Audio optional
  }
}

const BarcodeScannerModal = ({
  isOpen,
  onClose,
  onScan,
  title = "Scan Physical Barcode",
  instruction = "Point camera at a product barcode to scan automatically",
}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanLoopRef = useRef(null);
  const canvasRef = useRef(null);
  const roiCanvasRef = useRef(null);
  const zxingReaderRef = useRef(null);
  const nativeDetectorRef = useRef(null);
  const hasScannedRef = useRef(false);
  const isDecodingRef = useRef(false); // Prevent overlapping async decode calls
  const candidateRef = useRef({ code: "", count: 0, lastTime: 0 }); // 2-frame consensus to avoid misreads

  // Keep stable references to callback props
  const onScanRef = useRef(onScan);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onScanRef.current = onScan; }, [onScan]);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [scannedValue, setScannedValue] = useState("");
  const [engineType, setEngineType] = useState("ZXing High-Resolution Engine");

  // Initialize ZXing and Native BarcodeDetector once
  useEffect(() => {
    scanLog("Init", "Initializing barcode scanning engines...");

    
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, SUPPORTED_ZXING_FORMATS);

    const reader = new MultiFormatReader();
    reader.setHints(hints);
    zxingReaderRef.current = reader;
    scanLog("Engine", "Configured ZXing MultiFormatReader (fast mode, 25-row sampling)", {
      formats: SUPPORTED_ZXING_FORMATS.map((f) => BarcodeFormat[f] || f),
    });

    // 2. Initialize native BarcodeDetector with only SUPPORTED formats
    // Must call getSupportedFormats() first — constructor throws TypeError for unknown formats
    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      scanLog("Engine", "window.BarcodeDetector found in browser; checking supported formats...");
      window.BarcodeDetector.getSupportedFormats()
        .then((supported) => {
          scanLog("Engine", "Native BarcodeDetector supported formats:", supported);
          const filteredFormats = NATIVE_DETECTOR_FORMATS.filter((f) =>
            supported.includes(f)
          );
          scanLog("Engine", "Matching requested formats:", filteredFormats);
          if (filteredFormats.length > 0) {
            try {
              nativeDetectorRef.current = new window.BarcodeDetector({
                formats: filteredFormats,
              });
              setEngineType("Native Vision Engine");
              scanLog("Engine", "Native BarcodeDetector initialized successfully");
            } catch (err) {
              scanWarn("Engine", "Native BarcodeDetector instantiation failed, falling back to ZXing", err);
              nativeDetectorRef.current = null;
            }
          } else {
            scanLog("Engine", "No requested formats supported natively; using ZXing engine exclusively");
          }
        })
        .catch((err) => {
          scanWarn("Engine", "getSupportedFormats() rejected, using ZXing fallback", err);
          nativeDetectorRef.current = null;
        });
    } else {
      scanLog("Engine", "window.BarcodeDetector not available; using ZXing engine exclusively");
    }

    // Prepare offscreen canvases for frame decoding
    canvasRef.current = document.createElement("canvas");
    roiCanvasRef.current = document.createElement("canvas");
  }, []);

  // Stop camera tracks and cancel scanning loop
  const stopScanner = useCallback(() => {
    scanLog("Lifecycle", "stopScanner called", {
      hadActiveLoop: Boolean(scanLoopRef.current),
      hadActiveStream: Boolean(streamRef.current),
      framesScanned: debugStats.framesScanned,
    });
    if (scanLoopRef.current) {
      clearInterval(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    isDecodingRef.current = false;

    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => {
          scanLog("Camera", `Stopping video track: "${track.label}" (readyState: ${track.readyState})`);
          track.stop();
        });
      } catch (err) {
        scanError("Camera", "Error stopping video tracks", err);
      }
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Throttled frame processing loop (~120ms / ~8fps) to avoid CPU saturation
  const startScanLoop = useCallback(() => {
    // Clear any existing interval before starting a new one
    if (scanLoopRef.current) {
      clearInterval(scanLoopRef.current);
    }
    isDecodingRef.current = false;
    scanLog("Loop", "Starting 120ms frame polling interval (~8 FPS)");

    scanLoopRef.current = setInterval(async () => {
      if (hasScannedRef.current || isDecodingRef.current || !videoRef.current) return;

      const video = videoRef.current;

      // Ensure video is actively playing with valid dimensions
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        const now = Date.now();
        if (now - debugStats.lastNotReadyLogTime > 3000) {
          debugStats.lastNotReadyLogTime = now;
          scanWarn("Loop", "Video not ready for frame extraction", {
            readyState: video.readyState,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            paused: video.paused,
          });
        }
        return;
      }

      isDecodingRef.current = true;
      debugStats.framesScanned++;
      let detectedCode = null;
      let detectedFormat = null;
      let usedEngine = "none";

      try {
        // --- ENGINE 1: Native BarcodeDetector (Hardware-accelerated) ---
        if (nativeDetectorRef.current) {
          try {
            const results = await nativeDetectorRef.current.detect(video);
            if (results && results.length > 0 && results[0].rawValue) {
              const code = results[0].rawValue.trim();
              if (code) {
                detectedCode = code;
                detectedFormat = results[0].format || "Native Barcode";
                usedEngine = "Native BarcodeDetector";
                scanLog("Decode", "Native detector successfully decoded barcode", {
                  code: detectedCode,
                  format: detectedFormat,
                  boundingBox: results[0].boundingBox,
                });
              }
            }
          } catch (natErr) {
            if (!debugStats.lastNativeDetectError) {
              debugStats.lastNativeDetectError = natErr;
              scanWarn("Decode", "Native detector.detect() exception (falling back to ZXing)", natErr);
            }
          }
        }

        // --- ENGINE 2: ZXing MultiFormatReader (using RGBLuminanceSource — no canvas rotation) ---
        if (!detectedCode && zxingReaderRef.current) {
          try {
            const srcW = video.videoWidth;
            const srcH = video.videoHeight;
            const canvas = canvasRef.current;
            const roiCanvas = roiCanvasRef.current;

            // Downscale: limit to 640px wide to reduce getImageData pixel count
            const scale = Math.min(1, 640 / srcW);
            const dstW = Math.floor(srcW * scale);
            const dstH = Math.floor(srcH * scale);

            // Helper: decode a canvas region using RGBLuminanceSource
            const decodeCanvas = (cvs, label) => {
              const ctx = cvs.getContext("2d", { willReadFrequently: true });
              if (!ctx) return null;
              const imageData = ctx.getImageData(0, 0, cvs.width, cvs.height);
              const grayscale = rgbaToGrayscale(imageData);
              // RGBLuminanceSource: pass pre-computed grayscale buffer, not RGBA Int32Array.
              // isRotateSupported() returns false → OneDReader skips rotation fallback entirely.
              const luminance = new RGBLuminanceSource(grayscale, cvs.width, cvs.height);
              const bitmap = new BinaryBitmap(new HybridBinarizer(luminance));
              try {
                const result = zxingReaderRef.current.decodeWithState(bitmap);
                if (result && result.getText()) {
                  return {
                    code: result.getText().trim(),
                    format: BarcodeFormat[result.getBarcodeFormat()] || "Unknown",
                    engine: `ZXing (${label})`,
                  };
                }
              } catch (err) {
                if (err instanceof NotFoundException || err?.name === "NotFoundException") {
                  // Normal: no barcode detected in this region
                } else if (err instanceof ChecksumException || err?.name === "ChecksumException") {
                  debugStats.checksumErrorCount++;
                } else if (err instanceof FormatException || err?.name === "FormatException") {
                  debugStats.formatErrorCount++;
                } else {
                  debugStats.unknownErrorCount++;
                  if (!debugStats.lastZxingError) {
                    debugStats.lastZxingError = err;
                    scanError("Decode", `ZXing ${label} unexpected error`, err);
                  }
                }
              } finally {
                zxingReaderRef.current.reset();
              }
              return null;
            };

            if (canvas && roiCanvas && dstW > 0 && dstH > 0) {
              // 1. Center ROI (75% × 55% of source frame) — most likely barcode location
              const roiW = Math.floor(dstW * 0.75);
              const roiH = Math.floor(dstH * 0.55);
              const roiX = Math.floor((srcW - srcW * 0.75) / 2);
              const roiY = Math.floor((srcH - srcH * 0.55) / 2);

              if (roiW > 0 && roiH > 0) {
                roiCanvas.width = roiW;
                roiCanvas.height = roiH;
                const roiCtx = roiCanvas.getContext("2d", { willReadFrequently: true });
                if (roiCtx) {
                  roiCtx.drawImage(
                    video,
                    roiX, roiY, Math.floor(srcW * 0.75), Math.floor(srcH * 0.55),
                    0, 0, roiW, roiH
                  );
                  const roiResult = decodeCanvas(roiCanvas, "ROI");
                  if (roiResult) {
                    detectedCode = roiResult.code;
                    detectedFormat = roiResult.format;
                    usedEngine = roiResult.engine;
                    scanLog("Decode", "ZXing ROI decoded barcode successfully", {
                      code: detectedCode, format: detectedFormat,
                    });
                  }
                }
              }

              // 2. Full downscaled frame if ROI missed
              if (!detectedCode) {
                canvas.width = dstW;
                canvas.height = dstH;
                const ctx = canvas.getContext("2d", { willReadFrequently: true });
                if (ctx) {
                  ctx.drawImage(video, 0, 0, srcW, srcH, 0, 0, dstW, dstH);
                  const fullResult = decodeCanvas(canvas, "Full Frame");
                  if (fullResult) {
                    detectedCode = fullResult.code;
                    detectedFormat = fullResult.format;
                    usedEngine = fullResult.engine;
                    scanLog("Decode", "ZXing Full-Frame decoded barcode successfully", {
                      code: detectedCode, format: detectedFormat,
                    });
                  }
                }
              }
            }
          } catch (frameErr) {
            scanError("Decode", "Error during frame processing", frameErr);
          }
        }

        // Record no-detection count once per frame if neither engine found a code
        if (!detectedCode) {
          debugStats.noDetectCount++;
        }

        // Periodic rate-limited heartbeat (every ~3 seconds)
        const now = Date.now();
        if (now - debugStats.lastHeartbeatTime >= 3000) {
          debugStats.lastHeartbeatTime = now;
          scanLog("Heartbeat", "Scanning active", {
            framesScanned: debugStats.framesScanned,
            noDetections: debugStats.noDetectCount,
            checksumErrors: debugStats.checksumErrorCount,
            formatErrors: debugStats.formatErrorCount,
            unknownErrors: debugStats.unknownErrorCount,
            videoDimensions: `${video.videoWidth}x${video.videoHeight}`,
            activeEngine: nativeDetectorRef.current ? "Native Vision" : "ZXing",
          });
        }

        // --- CONSENSUS CONFIRMATION & SUCCESSFUL DETECTION ---
        if (detectedCode && !hasScannedRef.current) {
          const nowMs = Date.now();
          if (
            candidateRef.current.code === detectedCode &&
            nowMs - candidateRef.current.lastTime < 800
          ) {
            candidateRef.current.count++;
          } else {
            candidateRef.current = { code: detectedCode, count: 1, lastTime: nowMs };
          }

          // Require 2 matching detections to guarantee accuracy and eliminate transient misreads
          if (candidateRef.current.count >= 2) {
            hasScannedRef.current = true;
            scanLog("Success", `Barcode confirmed (2 matching frames): "${detectedCode}"`, {
              format: detectedFormat,
              engine: usedEngine,
              totalFramesScanned: debugStats.framesScanned,
            });
            setScannedValue(detectedCode);
            playSuccessSound();
            stopScanner();

            scanLog("Callback", `Scheduling onScan delivery with code "${detectedCode}" in 350ms`);
            setTimeout(() => {
              scanLog("Callback", `Executing onScan callback with "${detectedCode}"`);
              if (typeof onScanRef.current === "function") {
                onScanRef.current(detectedCode);
              }
              if (typeof onCloseRef.current === "function") {
                onCloseRef.current();
              }
            }, 350);
          } else {
            scanLog("Consensus", `Frame 1 candidate seen: "${detectedCode}" (${detectedFormat}), awaiting frame 2 confirmation...`);
          }
        }
      } finally {
        isDecodingRef.current = false;
      }
    }, 120); // ~8 FPS — fast enough for real barcodes, light on CPU
  }, [stopScanner]);

  // Start Camera Stream with optimal constraints
  const startScanner = useCallback(
    async (deviceId) => {
      scanLog("Lifecycle", "startScanner called", { deviceId: deviceId || "default (environment facing)" });
      setError("");
      setLoading(true);
      setScannedValue("");
      hasScannedRef.current = false;
      candidateRef.current = { code: "", count: 0, lastTime: 0 };
      debugStats.framesScanned = 0;
      debugStats.noDetectCount = 0;
      debugStats.checksumErrorCount = 0;
      debugStats.formatErrorCount = 0;
      debugStats.unknownErrorCount = 0;
      debugStats.lastHeartbeatTime = Date.now();

      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        scanError("Camera", "getUserMedia not available on navigator.mediaDevices (insecure context or unsupported browser)");
        setError(
          "Camera access is not supported by your browser or requires a secure connection (HTTPS). You can enter the barcode manually.",
        );
        setLoading(false);
        return;
      }

      stopScanner();

      // Optimal video constraints: Prefer rear camera with 720p/1080p for sharp barcode resolution
      const videoConstraints = {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        facingMode: deviceId ? undefined : { ideal: "environment" },
        width: { ideal: 1280, min: 640 },
        height: { ideal: 720, min: 480 },
      };
      scanLog("Camera", "Requesting camera stream with constraints", videoConstraints);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: videoConstraints,
        });

        streamRef.current = stream;

        // Request continuous autofocus if supported by camera hardware
        const [videoTrack] = stream.getVideoTracks();
        if (videoTrack) {
          const settings = typeof videoTrack.getSettings === "function" ? videoTrack.getSettings() : {};
          const capabilities = typeof videoTrack.getCapabilities === "function" ? videoTrack.getCapabilities() : {};
          scanLog("Camera", "Camera stream acquired successfully", {
            trackLabel: videoTrack.label,
            trackId: videoTrack.id,
            facingMode: settings.facingMode,
            width: settings.width,
            height: settings.height,
            frameRate: settings.frameRate,
            focusModes: capabilities.focusMode || "not supported",
          });

          if (capabilities.focusMode && capabilities.focusMode.includes("continuous")) {
            try {
              await videoTrack.applyConstraints({
                advanced: [{ focusMode: "continuous" }],
              });
              scanLog("Camera", "Continuous autofocus constraint applied");
            } catch (fcErr) {
              scanWarn("Camera", "Could not apply continuous autofocus constraint", fcErr);
            }
          }
        }

        if (!videoRef.current) {
          scanWarn("Camera", "videoRef is null after getUserMedia (modal closed prematurely), stopping stream");
          stream.getTracks().forEach((track) => track.stop());
          setLoading(false);
          return;
        }

        videoRef.current.srcObject = stream;
        scanLog("Video", "Assigned stream to video.srcObject, awaiting video readiness...");

        // Wait until metadata is loaded and video is playing (with 2.5s fallback)
        await new Promise((resolve) => {
          const video = videoRef.current;
          if (!video || video.readyState >= 2) {
            resolve();
            return;
          }
          let resolved = false;
          const done = () => {
            if (!resolved) {
              resolved = true;
              clearTimeout(timer);
              if (video) {
                video.removeEventListener("loadeddata", done);
                video.removeEventListener("loadedmetadata", done);
                video.removeEventListener("canplay", done);
              }
              resolve();
            }
          };
          const timer = setTimeout(done, 2500);
          video.addEventListener("loadeddata", done);
          video.addEventListener("loadedmetadata", done);
          video.addEventListener("canplay", done);
        });

        if (videoRef.current) {
          scanLog("Video", "Video element readyState is ready", {
            readyState: videoRef.current.readyState,
            videoWidth: videoRef.current.videoWidth,
            videoHeight: videoRef.current.videoHeight,
          });

          try {
            await videoRef.current.play();
            scanLog("Video", "Video play() resolved successfully");
          } catch (playErr) {
            scanWarn("Video", "Video play() rejected or interrupted", playErr);
          }
        }

        setLoading(false);

        // Start scanning loop
        startScanLoop();

        // Query available camera devices now that permissions are granted
        try {
          const deviceList = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = deviceList.filter((d) => d.kind === "videoinput");
          scanLog("Camera", `Discovered ${videoInputs.length} video input devices:`, videoInputs.map((d) => ({ id: d.deviceId, label: d.label })));
          if (videoInputs.length > 0) {
            setDevices(videoInputs);
          }
        } catch (enumErr) {
          scanWarn("Camera", "Device enumeration failed", enumErr);
        }
      } catch (err) {
        scanError("Camera", `Camera startup failed: ${err.name} - ${err.message}`, err);
        stopScanner();
        setLoading(false);

        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError(
            "Camera permission was denied. Please allow camera access in your browser settings or enter the barcode manually.",
          );
        } else if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          setError("No camera was found on your device. You can enter the barcode manually.");
        } else if (
          err.name === "NotReadableError" ||
          err.name === "TrackStartError"
        ) {
          setError("Camera is currently in use by another application.");
        } else {
          setError(
            err.message || "Failed to start camera. Please enter the barcode manually.",
          );
        }
      }
    },
    [stopScanner, startScanLoop],
  );

  // Open/close lifecycle
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startScanner(selectedDeviceId);
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleDeviceChange = (e) => {
    const newDeviceId = e.target.value;
    setSelectedDeviceId(newDeviceId);
    startScanner(newDeviceId);
  };

  const handleRetry = () => {
    startScanner(selectedDeviceId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-semibold">
              <FiCamera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
              <p className="text-xs text-gray-500">{instruction}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            aria-label="Close scanner"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Device Selector & Engine Info */}
        <div className="px-6 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs">
          {devices.length > 1 ? (
            <div className="flex items-center gap-2 flex-1 mr-3">
              <label htmlFor="barcode-camera-select" className="text-gray-600 font-medium whitespace-nowrap">
                Camera:
              </label>
              <select
                id="barcode-camera-select"
                value={selectedDeviceId}
                onChange={handleDeviceChange}
                className="flex-1 py-1 px-2 border border-gray-200 rounded-md bg-white text-gray-700 outline-hidden focus:ring-1 focus:ring-blue-500 text-xs truncate"
              >
                {devices.map((device, index) => (
                  <option key={device.deviceId || index} value={device.deviceId}>
                    {device.label || `Camera ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="text-gray-500">Auto Rear Camera</span>
          )}

          {engineType && (
            <span className="text-[11px] font-medium text-gray-500 bg-gray-200/70 px-2 py-0.5 rounded-sm">
              {engineType}
            </span>
          )}
        </div>

        {/* Viewfinder Video Area */}
        <div className="relative bg-black aspect-[4/3] w-full flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain"
          />

          {/* Loading Indicator */}
          {loading && !error && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white gap-3 z-10">
              <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-sm font-medium">Starting camera...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="absolute inset-0 bg-gray-900/95 flex flex-col items-center justify-center p-6 text-center text-white z-20">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-3">
                <FiAlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium mb-1 text-red-200">Camera Unavailable</p>
              <p className="text-xs text-gray-300 max-w-sm mb-4 leading-relaxed">{error}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition"
              >
                <FiRefreshCw className="w-3.5 h-3.5" /> Retry Camera
              </button>
            </div>
          )}

          {/* Scanner Targeting Reticle */}
          {!error && !loading && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Dimmed backdrop around target area */}
              <div
                className={`relative w-72 h-48 sm:w-80 sm:h-52 border-2 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] transition-colors duration-200 ${
                  scannedValue
                    ? "border-emerald-400 bg-emerald-500/20"
                    : "border-white/80"
                }`}
              >
                {/* Targeting Corners */}
                <span
                  className={`absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 rounded-tl-lg ${
                    scannedValue ? "border-emerald-400" : "border-blue-500"
                  }`}
                />
                <span
                  className={`absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 rounded-tr-lg ${
                    scannedValue ? "border-emerald-400" : "border-blue-500"
                  }`}
                />
                <span
                  className={`absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 rounded-bl-lg ${
                    scannedValue ? "border-emerald-400" : "border-blue-500"
                  }`}
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 rounded-br-lg ${
                    scannedValue ? "border-emerald-400" : "border-blue-500"
                  }`}
                />

                {/* Animated Red Laser Scan Line (stops upon scan) */}
                {!scannedValue && (
                  <div className="absolute inset-x-2 top-0 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse animate-bounce" />
                )}

                {/* Success Indicator Badge */}
                {scannedValue && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/40 rounded-2xl backdrop-blur-2xs animate-in zoom-in-90 duration-150">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center mb-1 text-white shadow-lg">
                      <FiCheck className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-300">
                      Barcode Detected!
                    </span>
                    <span className="text-sm font-mono font-bold mt-0.5 bg-black/60 px-2 py-0.5 rounded">
                      {scannedValue}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Supports: EAN-13, EAN-8, UPC, Code 128, Code 39</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-md font-medium transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;
