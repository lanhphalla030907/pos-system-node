// components/product/ProductModal.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Config } from "../../util/config";
import { generateBarcode, getProductByBarcode } from "../../api/productApi";
import BarcodeScannerModal from "../common/BarcodeScannerModal";
import CameraCaptureModal from "../common/CameraCaptureModal";
import ProductBarcodeLabel from "./ProductBarcodeLabel";
import {
  FiCamera,
  FiRefreshCw,
  FiTrash2,
  FiAlertCircle,
  FiCheck,
  FiEdit2,
  FiCpu,
  FiUpload,
  FiRepeat,
} from "react-icons/fi";

const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3 MB

const ProductModal = ({
  isOpen,
  onClose,
  categories = [],
  isEdit = false,
  selectedProduct = null,
  onSubmit,
}) => {
  const fileInputRef = useRef(null);
  const barcodeInputRef = useRef(null);
  const hasGeneratedInitialBarcodeRef = useRef(false);

  const [barcodeMode, setBarcodeMode] = useState("generate"); // "generate" | "scan" | "manual"
  const [formData, setFormData] = useState({
    category_id: "",
    barcode: "",
    name: "",
    brand: "",
    description: "",
    qty: "0",
    min_stock: "0",
    price: "0",
    cost_price: "0",
    discount: "0",
    status: "1",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [imageSizeText, setImageSizeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [barcodeError, setBarcodeError] = useState("");
  const [barcodeSuccess, setBarcodeSuccess] = useState("");
  const [imageError, setImageError] = useState("");

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Stable callbacks for child modals to avoid re-render cascades
  const closeScannerModal = useCallback(() => setIsScannerOpen(false), []);
  const closeCameraModal = useCallback(() => setIsCameraOpen(false), []);
  const triggerFileInput = useCallback(() => fileInputRef.current?.click(), []);

  // Check barcode uniqueness against backend
  const checkBarcodeUniqueness = useCallback(
    async (codeToTest) => {
      if (!codeToTest || !codeToTest.trim()) {
        setBarcodeError("");
        setBarcodeSuccess("");
        return;
      }

      const clean = codeToTest.trim();
      try {
        const res = await getProductByBarcode(clean);
        if (res?.success && res?.data) {
          const found = res.data;
          // If editing and barcode belongs to the product itself, that's valid
          if (isEdit && selectedProduct && String(found.id) === String(selectedProduct.id)) {
            setBarcodeError("");
            setBarcodeSuccess("Current product barcode");
          } else {
            setBarcodeError(
              `This barcode already belongs to another product ("${found.name}")`,
            );
            setBarcodeSuccess("");
          }
        } else {
          setBarcodeError("");
          setBarcodeSuccess("Barcode is available");
        }
      } catch (err) {
        console.error("Barcode check error:", err);
      }
    },
    [isEdit, selectedProduct],
  );

  // Generate barcode using API
  const generateNewBarcode = useCallback(async () => {
    setBarcodeLoading(true);
    setBarcodeError("");
    setBarcodeSuccess("");
    try {
      const response = await generateBarcode();
      if (response && response.success && response.barcode) {
        setFormData((prev) => ({
          ...prev,
          barcode: response.barcode,
        }));
        setBarcodeSuccess(`Generated: ${response.barcode}`);
      }
    } catch (error) {
      console.error("Error generating barcode:", error);
      setBarcodeError("Failed to generate barcode from server.");
    } finally {
      setBarcodeLoading(false);
    }
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      category_id: categories[0]?.Id || "",
      barcode: "",
      name: "",
      brand: "",
      description: "",
      qty: "0",
      min_stock: "0",
      price: "0",
      cost_price: "0",
      discount: "0",
      status: "1",
      image: null,
    });
    setImagePreview("");
    setImageSizeText("");
    setImageError("");
    setBarcodeError("");
    setBarcodeSuccess("");
    setLoading(false);
    setBarcodeLoading(false);
    setBarcodeMode("generate");
    setIsScannerOpen(false);
    setIsCameraOpen(false);
  }, [categories]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      resetForm();
    }
  }, [isOpen, resetForm]);

  // Initialize barcode & category when adding new product (once per modal open)
  useEffect(() => {
    if (isOpen && !isEdit && !hasGeneratedInitialBarcodeRef.current) {
      hasGeneratedInitialBarcodeRef.current = true;
      setBarcodeMode("generate");
      generateNewBarcode();
    }
    if (!isOpen) {
      hasGeneratedInitialBarcodeRef.current = false;
    }
  }, [isOpen, isEdit, generateNewBarcode]);

  useEffect(() => {
    if (categories.length > 0 && !isEdit && isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => ({
        ...prev,
        category_id: prev.category_id || categories[0].Id,
      }));
    }
  }, [categories, isEdit, isOpen]);

  // Populate form when editing
  useEffect(() => {
    if (isEdit && selectedProduct && isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBarcodeMode("manual");
      setFormData({
        category_id: selectedProduct.category_id || categories[0]?.Id || "",
        barcode: selectedProduct.barcode || "",
        name: selectedProduct.name || "",
        brand: selectedProduct.brand || "",
        description: selectedProduct.description || "",
        qty: selectedProduct.qty?.toString() || "0",
        min_stock: selectedProduct.min_stock?.toString() || "0",
        price: selectedProduct.price?.toString() || "0",
        cost_price: selectedProduct.cost_price?.toString() || "0",
        discount: selectedProduct.discount?.toString() || "0",
        status: selectedProduct.status?.toString() || "1",
        image: null,
      });

      if (selectedProduct.image) {
        setImagePreview(
          selectedProduct.image.startsWith("http")
            ? selectedProduct.image
            : `${Config.base_url2}uploads/products/${selectedProduct.image}`,
        );
        setImageSizeText("Existing saved image");
      }
    }
  }, [isEdit, selectedProduct, categories, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "barcode") {
      setBarcodeMode("manual");
      setBarcodeSuccess("");
      // Debounce check
      const trimmed = value.trim();
      if (trimmed) {
        checkBarcodeUniqueness(trimmed);
      } else {
        setBarcodeError("");
      }
    }
  };

  // Switch barcode mode
  const handleModeSwitch = (mode) => {
    setBarcodeMode(mode);
    setBarcodeError("");
    setBarcodeSuccess("");

    if (mode === "generate") {
      generateNewBarcode();
    } else if (mode === "scan") {
      setIsScannerOpen(true);
    } else if (mode === "manual") {
      setTimeout(() => {
        barcodeInputRef.current?.focus();
        barcodeInputRef.current?.select();
      }, 50);
    }
  };

  // Barcode scanned from camera
  const handleBarcodeScanned = useCallback((scannedCode) => {
    const clean = scannedCode.trim();
    console.log(`[ProductModal] Received scanned barcode from camera callback: "${clean}"`);
    setFormData((prev) => ({ ...prev, barcode: clean }));
    setBarcodeMode("scan");
    setBarcodeSuccess(`Scanned: ${clean}`);
    checkBarcodeUniqueness(clean);
  }, [checkBarcodeUniqueness]);

  // Image selected from disk
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("Image must be 3 MB or smaller.");
      e.target.value = "";
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setImageError("Only JPG, JPEG, and PNG images are allowed.");
      e.target.value = "";
      return;
    }

    setImageError("");
    setFormData((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
    setImageSizeText(`${(file.size / 1024).toFixed(1)} KB`);
  };

  // Image captured from camera
  const handleCameraCapture = useCallback((file, previewUrl) => {
    setImageError("");
    setFormData((prev) => ({ ...prev, image: file }));
    setImagePreview(previewUrl);
    setImageSizeText(`Captured ${(file.size / 1024).toFixed(1)} KB`);
  }, []);

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview("");
    setImageSizeText("");
    setImageError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (barcodeError) return;

    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        {/* Modal Window */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {isEdit ? "Edit Product" : "Add New Product"}
                </h3>
                <p className="text-xs text-gray-500">
                  {isEdit
                    ? "Update product details, barcode, or image"
                    : "Fill in the product details and generate or scan a barcode"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
              {/* Row 1: Name & Barcode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                {/* Enhanced Barcode Section */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Barcode
                    </label>

                    {/* Mode Selector Tabs */}
                    <div className="inline-flex rounded-lg bg-gray-100 p-0.5 border border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleModeSwitch("generate")}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition ${
                          barcodeMode === "generate"
                            ? "bg-white text-blue-600 shadow-xs"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                        title="Generate auto sequential barcode"
                      >
                        <FiCpu className="w-3 h-3" /> Auto
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModeSwitch("scan")}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition ${
                          barcodeMode === "scan"
                            ? "bg-white text-blue-600 shadow-xs"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                        title="Scan with camera"
                      >
                        <FiCamera className="w-3 h-3" /> Scan
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModeSwitch("manual")}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition ${
                          barcodeMode === "manual"
                            ? "bg-white text-blue-600 shadow-xs"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                        title="Type manually or use USB barcode scanner"
                      >
                        <FiEdit2 className="w-3 h-3" /> Manual / USB
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      ref={barcodeInputRef}
                      type="text"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        // Support USB barcode scanner sending Enter
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = e.target.value.trim();
                          setFormData((prev) => ({ ...prev, barcode: val }));
                          setBarcodeMode("manual");
                          if (val) {
                            checkBarcodeUniqueness(val);
                          }
                        }
                      }}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono text-sm bg-white ${
                        barcodeError
                          ? "border-red-400 bg-red-50/30 text-red-900"
                          : "border-gray-300"
                      }`}
                      placeholder={
                        barcodeMode === "manual"
                          ? "Type or scan with USB scanner..."
                          : "Barcode (auto-generated, scanned, or typed)"
                      }
                    />

                    {/* Quick Action Button beside input */}
                    {barcodeMode === "generate" && (
                      <button
                        type="button"
                        onClick={generateNewBarcode}
                        disabled={barcodeLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition flex items-center gap-1 disabled:opacity-50"
                      >
                        <FiRefreshCw
                          className={`w-3 h-3 ${barcodeLoading ? "animate-spin" : ""}`}
                        />
                        {barcodeLoading ? "Generating..." : "New"}
                      </button>
                    )}
                    {barcodeMode === "scan" && (
                      <button
                        type="button"
                        onClick={() => setIsScannerOpen(true)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition flex items-center gap-1"
                      >
                        <FiCamera className="w-3.5 h-3.5" /> Re-scan
                      </button>
                    )}
                  </div>

                  {/* Feedback Messages */}
                  {barcodeError && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {barcodeError}
                    </p>
                  )}
                  {!barcodeError && barcodeSuccess && (
                    <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                      <FiCheck className="w-3.5 h-3.5 flex-shrink-0" />
                      {barcodeSuccess}
                    </p>
                  )}
                  {!barcodeError && !barcodeSuccess && (
                    <p className="mt-1 text-xs text-gray-400">
                      {barcodeMode === "manual"
                        ? "Tip: USB barcode scanners can scan directly into this input."
                        : barcodeMode === "scan"
                          ? "Click 'Re-scan' to open camera barcode scanner."
                          : "Tip: Click 'New' to regenerate, or scan/type to use physical barcode."}
                    </p>
                  )}

                  {/* Visual Scannable Barcode Label & Thermal Print Action */}
                  {formData.barcode && (
                    <div className="mt-3">
                      <ProductBarcodeLabel
                        barcode={formData.barcode}
                        productName={formData.name}
                        price={formData.price}
                        compact={true}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Brand & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                    placeholder="Enter brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm bg-white"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.Id} value={cat.Id}>
                        {cat.Name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Price, Cost Price, Quantity, Min Stock, Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="cost_price"
                    value={formData.cost_price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="qty"
                    value={formData.qty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Stock
                  </label>
                  <input
                    type="number"
                    name="min_stock"
                    value={formData.min_stock}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Row 4: Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none text-sm"
                  placeholder="Enter product description..."
                />
              </div>

              {/* Row 5: Status & Enhanced Image Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm bg-white"
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>

                {/* Product Image Capture & Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image
                  </label>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Choose File or Take Photo buttons */}
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition shadow-xs"
                    >
                      <FiUpload className="w-3.5 h-3.5 text-gray-500" />
                      Choose File
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 border border-purple-200 bg-purple-50 hover:bg-purple-100 rounded-lg text-xs font-medium text-purple-700 transition shadow-xs"
                    >
                      <FiCamera className="w-3.5 h-3.5 text-purple-600" />
                      Take Photo
                    </button>
                  </div>

                  {/* Image Error */}
                  {imageError && (
                    <p className="text-xs text-red-600 mb-2 flex items-center gap-1">
                      <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {imageError}
                    </p>
                  )}

                  {/* Image Preview Card */}
                  {imagePreview && (
                    <div className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 bg-white flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">
                          {formData.image?.name || "Product Image"}
                        </p>
                        {imageSizeText && (
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {imageSizeText}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            type="button"
                            onClick={() => setIsCameraOpen(true)}
                            className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-800 font-medium"
                          >
                            <FiRepeat className="w-3 h-3" /> Retake
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:text-red-800 font-medium"
                          >
                            <FiTrash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {!imagePreview && (
                    <p className="text-xs text-gray-400">
                      Supports JPG, PNG, or WebP up to 3 MB.
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || barcodeLoading || Boolean(barcodeError)}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-2 shadow-xs"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : isEdit ? (
                    "Update Product"
                  ) : (
                    "Create Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={closeScannerModal}
        onScan={handleBarcodeScanned}
        title="Scan Product Barcode"
        instruction="Position the product barcode within the camera viewfinder"
      />

      {/* Camera Photo Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={closeCameraModal}
        onCapture={handleCameraCapture}
        onFallbackToFile={triggerFileInput}
        title="Take Product Photo"
      />
    </>
  );
};

export default ProductModal;
