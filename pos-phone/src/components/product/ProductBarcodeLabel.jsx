// components/product/ProductBarcodeLabel.jsx
import { useEffect, useRef, useState, useMemo } from "react";
import JsBarcode from "jsbarcode";
import { useReactToPrint } from "react-to-print";
import { resolveBarcodeFormat } from "../../util/barcode";
import { FiPrinter, FiAlertCircle, FiCheck, FiInfo } from "react-icons/fi";

const ProductBarcodeLabel = ({
  barcode = "",
  productName = "",
  price = "",
  currency = "$",
  compact = false,
}) => {
  const svgRef = useRef(null);
  const printRef = useRef(null);
  const [selectedFormat, setSelectedFormat] = useState("auto");
  const [jsBarcodeError, setJsBarcodeError] = useState("");

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const cleanBarcode = barcode ? barcode.trim() : "";

  // Derive format resolution synchronously (no cascading setState in effects)
  const resolution = useMemo(() => {
    if (!cleanBarcode) {
      return { format: null, isValid: false, error: "" };
    }
    return resolveBarcodeFormat(cleanBarcode, selectedFormat);
  }, [cleanBarcode, selectedFormat]);

  const activeFormat = resolution.label || resolution.format;
  const formatWarning = resolution.warning || "";
  const displayError = resolution.error || jsBarcodeError;

  // Render barcode graphic whenever barcode or format changes
  useEffect(() => {
    if (!cleanBarcode || !resolution.isValid || !resolution.format || !svgRef.current) {
      if (svgRef.current) {
        svgRef.current.innerHTML = "";
      }
      return;
    }

    try {
      JsBarcode(svgRef.current, cleanBarcode, {
        format: resolution.format,
        lineColor: "#111827",
        width: 2,
        height: compact ? 42 : 55,
        displayValue: true,
        font: "monospace",
        fontSize: compact ? 12 : 14,
        textMargin: 3,
        margin: 8,
        background: "#ffffff",
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setJsBarcodeError("");
    } catch (err) {
      console.error("JsBarcode render error:", err);
      setJsBarcodeError(
        err.message || "Failed to render barcode. The characters may not be valid for this format."
      );
    }
  }, [cleanBarcode, resolution.isValid, resolution.format, compact]);

  if (!cleanBarcode) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400 bg-gray-50/50">
        Enter, generate, or scan a barcode to preview the scannable label.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-xs space-y-3">
      {/* Format Selector & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700">Barcode Label</span>
          {activeFormat && (
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
              <FiCheck className="w-3 h-3" /> {activeFormat}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="barcode-format-select" className="text-xs text-gray-500">
            Format:
          </label>
          <select
            id="barcode-format-select"
            value={selectedFormat}
            onChange={(e) => {
              setSelectedFormat(e.target.value);
              setJsBarcodeError("");
            }}
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-blue-500 focus:outline-hidden"
          >
            <option value="auto">Auto Detect</option>
            <option value="INTERNAL">Internal / Custom (Variable Length)</option>
            <option value="CODE128">Code 128 (Standard)</option>
            <option value="EAN13">EAN-13 (13 Digits)</option>
            <option value="UPC">UPC-A (12 Digits)</option>
            <option value="EAN8">EAN-8 (8 Digits)</option>
          </select>

          <button
            type="button"
            onClick={handlePrint}
            disabled={Boolean(displayError)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1 text-xs font-medium text-white hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            title="Print thermal barcode label"
          >
            <FiPrinter className="w-3.5 h-3.5" />
            Print Label
          </button>
        </div>
      </div>

      {/* Warning if auto-fallback occurred */}
      {formatWarning && !displayError && (
        <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-800 border border-amber-200">
          <FiInfo className="w-3.5 h-3.5 shrink-0" />
          <span>{formatWarning}</span>
        </div>
      )}

      {/* Error state */}
      {displayError ? (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Barcode Format Error</p>
            <p className="mt-0.5 text-red-600">{displayError}</p>
          </div>
        </div>
      ) : (
        /* Scannable Barcode SVG Preview */
        <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50/70 p-3 border border-gray-100">
          {productName && (
            <p className="text-xs font-medium text-gray-800 truncate max-w-full mb-1">
              {productName}
            </p>
          )}

          <div className="bg-white p-2 rounded shadow-2xs border border-gray-100 flex items-center justify-center overflow-x-auto max-w-full">
            <svg ref={svgRef} className="max-w-full h-auto" />
          </div>

          {price && Number(price) > 0 && (
            <p className="text-xs font-semibold text-gray-900 mt-1">
              {currency} {Number(price).toFixed(2)}
            </p>
          )}
        </div>
      )}

      {/* Hidden Thermal Print Template */}
      <div className="hidden">
        <div
          ref={printRef}
          className="printable-barcode-label font-sans text-black"
          style={{
            width: "50mm",
            minHeight: "30mm",
            padding: "2mm",
            textAlign: "center",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
          }}
        >
          {productName && (
            <div
              style={{
                fontSize: "10pt",
                fontWeight: "bold",
                lineHeight: "1.1",
                marginBottom: "1mm",
                maxWidth: "46mm",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {productName}
            </div>
          )}

          {price && Number(price) > 0 && (
            <div
              style={{
                fontSize: "9pt",
                fontWeight: "600",
                marginBottom: "1mm",
              }}
            >
              Price: {currency} {Number(price).toFixed(2)}
            </div>
          )}

          <div style={{ display: "inline-block", maxWidth: "48mm" }}>
            <svg
              ref={(node) => {
                if (node && cleanBarcode && !displayError) {
                  try {
                    const res = resolveBarcodeFormat(cleanBarcode, selectedFormat);
                    if (res.isValid && res.format) {
                      JsBarcode(node, cleanBarcode, {
                        format: res.format,
                        lineColor: "#000000",
                        width: 1.8,
                        height: 38,
                        displayValue: true,
                        font: "monospace",
                        fontSize: 10,
                        textMargin: 2,
                        margin: 2,
                      });
                    }
                  } catch (e) {
                    console.error("Print barcode render failed:", e);
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductBarcodeLabel;
