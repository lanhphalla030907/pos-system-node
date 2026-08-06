// components/product/ProductModal.jsx
import React, { useState, useEffect } from "react";
import { Config } from "../../util/config";
import { generateBarcode } from "../../api/productApi";

const ProductModal = ({
  isOpen,
  onClose,
  categories,
  isEdit,
  selectedProduct,
  onSubmit,
}) => {
  const [barcode,setbarcode] =useState([]);
  const [formData, setFormData] = useState({
    category_id: "",
    barcode: "",
    name: "",
    brand: "",
    description: "",
    qty: "0",
    price: "0",
    discount: "0",
    status: "1",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [barcodeLoading, setBarcodeLoading] = useState(false);

  // Generate barcode using API
  const generateNewBarcode = async () => {
    setBarcodeLoading(true);
    try {
      const response = await generateBarcode();
      if (response && response.success && response.barcode) {
        setFormData((prev) => ({
          ...prev,
          barcode: response.barcode, 
        }));
        setbarcode(response.barcode)
      }
    } catch (error) {
      console.error("Error generating barcode:", error);
    } finally {
      setBarcodeLoading(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Generate barcode when modal opens for adding new product
  useEffect(() => {
    if (isOpen && !isEdit) {
      generateNewBarcode();
    }
  }, [isOpen, isEdit]);

  // Set default category when categories load
  useEffect(() => {
    if (categories.length > 0 && !isEdit && isOpen) {
      setFormData((prev) => ({ ...prev, category_id: categories[0].Id }));
    }
  }, [categories, isEdit, isOpen]);

  // Populate form when editing
  useEffect(() => {
    if (isEdit && selectedProduct && isOpen) {
      setFormData({
        category_id: selectedProduct.category_id || categories[0]?.Id || "",
        barcode: selectedProduct.barcode || "",
        name: selectedProduct.name || "",
        brand: selectedProduct.brand || "",
        description: selectedProduct.description || "",
        qty: selectedProduct.qty?.toString() || "0",
        price: selectedProduct.price?.toString() || "0",
        discount: selectedProduct.discount?.toString() || "0",
        status: selectedProduct.status?.toString() || "1",
        image: null,
      });

      if (selectedProduct.image) {
        setImagePreview(
          `${Config.base_url}uploads/products/${selectedProduct.image}`,
        );
      }
    }
  }, [isEdit, selectedProduct, categories, isOpen]);

  const resetForm = () => {
    setFormData({
      category_id: categories[0]?.Id || "",
      barcode: "",
      name: "",
      brand: "",
      description: "",
      qty: "0",
      price: "0",
      discount: "0",
      status: "1",
      image: null,
    });
    setImagePreview("");
    setLoading(false);
    setBarcodeLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
            <h3 className="text-xl font-semibold text-gray-900">
              {isEdit ? "Edit Product" : "Add New Product"}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg
                className="w-5 h-5 text-gray-500"
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

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-6 py-6">
            <div className="space-y-5">
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barcode
                    {!isEdit && (
                      <button
                        type="button"
                        onClick={generateNewBarcode}
                        disabled={barcodeLoading}
                        className="ml-2 text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                      >
                        {barcodeLoading ? "Generating..." : "↻ Generate New"}
                      </button>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="barcode"
                      value={formData.barcode} // Shows "BAR-000001" from server
                      onChange={handleInputChange}
                      disabled={!isEdit} // Disabled for new products
                      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        !isEdit
                          ? "bg-gray-100 text-gray-700 cursor-not-allowed"
                          : ""
                      }`}
                      placeholder={barcode}
                    />
                  </div>
                  {!isEdit && formData.barcode && (
                    <p className="mt-1 text-xs text-green-600">
                      ✓ Barcode generated: {formData.barcode}
                    </p>
                  )}
                  {!isEdit && !formData.barcode && !barcodeLoading && (
                    <p className="mt-1 text-xs text-gray-500">
                      Generating barcode from server...
                    </p>
                  )}
                  {isEdit && (
                    <p className="mt-1 text-xs text-gray-500">
                      You can edit the barcode in edit mode
                    </p>
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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

              {/* Row 3: Price, Quantity, Discount */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  placeholder="Enter product description..."
                />
              </div>

              {/* Row 5: Status & Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || barcodeLoading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
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
  );
};

export default ProductModal;
