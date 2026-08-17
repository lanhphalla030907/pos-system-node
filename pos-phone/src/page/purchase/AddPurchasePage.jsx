// pages/AddPurchasePage.jsx - With Product Image Display
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCurrency } from '../../util/orderHelper';
import useProduct from '../../hooks/useProduct';
import useSupplier from '../../hooks/useSupplier';
import { usePurchase } from '../../hooks/usePurchase';
import { useAlert } from '../../components/common/Alert';
import ProductImage from '../../components/product/ProductImage';
import {
  FiSearch,
  FiX,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiPackage,
  FiTruck,
  FiCreditCard,
  FiDollarSign,
  FiFileText,
  FiUser,
  FiShoppingBag,
  FiArrowLeft,
  FiSave,
} from 'react-icons/fi';

const AddPurchasePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const alert = useAlert();

  const { addPurchase, editPurchase, loadPurchaseById, loading } = usePurchase();
  const { suppliers, loadSuppliers } = useSupplier();
  const { products, loadProducts } = useProduct();

  const [formData, setFormData] = useState({
    supplier_id: '',
    payment_method: 'cash',
    shipping_cost: 0,
    shipping_company: '',
    remark: '',
    status: 'completed',
  });

  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemQty, setItemQty] = useState(1);
  const [itemCost, setItemCost] = useState(0);
  const [itemRetailPrice, setItemRetailPrice] = useState(0);
  const [itemDiscount, setItemDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Product Search Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);

  const hasLoaded = useRef(false);
  const searchInputRef = useRef(null);

  // Helper function to safely get number
  const safeNumber = (value) => {
    return parseFloat(value) || 0;
  };

  // Helper function to safely format currency in display
  const safeCurrency = (value) => {
    return safeNumber(value).toFixed(2);
  };

  // Load data on mount
  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadSuppliers({ status: 1 });
      loadProducts({ page: 1, limit: 1000 });
    }
  }, [loadSuppliers, loadProducts]);

  // Load purchase data if editing
  useEffect(() => {
    if (isEdit) {
      loadPurchase();
    }
  }, [isEdit]);

  // Filter products when search term changes
  useEffect(() => {
    if (productSearchTerm.trim().length >= 2) {
      setProductSearchLoading(true);
      const timer = setTimeout(() => {
        const filtered = products.filter(p => 
          p.name?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
          p.barcode?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
          p.code?.toLowerCase().includes(productSearchTerm.toLowerCase())
        );
        setFilteredProducts(filtered);
        setProductSearchLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setFilteredProducts([]);
      setProductSearchLoading(false);
    }
  }, [productSearchTerm, products]);

  const loadPurchase = async () => {
    try {
      const res = await loadPurchaseById(id);
      if (res?.success && res.data) {
        const data = res.data;
        setFormData({
          supplier_id: data.supplier?.id || '',
          payment_method: data.payment_method || 'cash',
          shipping_cost: safeNumber(data.shipping_cost),
          shipping_company: data.shipping_company || '',
          remark: data.remark || '',
          status: data.status || 'completed',
        });
        // Convert items data to numbers
        setItems((data.items || []).map(item => ({
          ...item,
          qty: safeNumber(item.qty),
          cost: safeNumber(item.cost),
          retail_price: safeNumber(item.retail_price),
          discount: safeNumber(item.discount),
          amount: safeNumber(item.amount),
        })));
        setPaidAmount(safeNumber(data.paid_amount));
      }
    } catch (error) {
      console.error('Error loading purchase:', error);
      alert.error('Failed to load purchase data', {
        description: 'Please try again.',
      });
    }
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.qty * item.cost - (item.discount || 0)), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + (safeNumber(formData.shipping_cost) || 0);
  };

  const subtotal = calculateSubtotal();
  const total = calculateTotal();

  // Open product selection modal
  const openProductModal = () => {
    setProductSearchTerm('');
    setFilteredProducts([]);
    setIsProductModalOpen(true);
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  // Select product from modal
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setItemCost(safeNumber(product.cost) || 0);
    setItemRetailPrice(safeNumber(product.price) || 0);
    setIsProductModalOpen(false);
    
    // Auto focus to quantity
    setTimeout(() => {
      const qtyInput = document.getElementById('itemQty');
      if (qtyInput) qtyInput.focus();
    }, 100);
  };

  // Add item to list
  const handleAddItem = () => {
    if (!selectedProduct) {
      alert.warning('Please select a product', {
        description: 'Click the search button to find a product.',
      });
      return;
    }

    if (itemQty <= 0) {
      alert.warning('Quantity must be greater than 0', {
        description: 'Please enter a valid quantity.',
      });
      return;
    }

    if (itemCost < 0) {
      alert.warning('Cost cannot be negative', {
        description: 'Please enter a valid cost.',
      });
      return;
    }

    const existingItem = items.find(item => item.product_id === selectedProduct.id);
    if (existingItem) {
      alert.warning('Product already added', {
        description: 'Please update quantity in the list.',
      });
      return;
    }

    const newItem = {
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      barcode: selectedProduct.barcode || '',
      qty: itemQty,
      cost: itemCost,
      retail_price: itemRetailPrice || safeNumber(selectedProduct.price) || 0,
      discount: itemDiscount || 0,
      amount: itemQty * itemCost - (itemDiscount || 0),
    };

    setItems([...items, newItem]);
    resetItemForm();
    alert.success('Item added successfully!', {
      description: `"${selectedProduct.name}" has been added to the list.`,
      duration: 2000,
    });
  };

  // Reset item form
  const resetItemForm = () => {
    setSelectedProduct(null);
    setItemQty(1);
    setItemCost(0);
    setItemRetailPrice(0);
    setItemDiscount(0);
  };

  // Remove item from list
  const handleRemoveItem = (index) => {
    const item = items[index];
    
    if (!window.confirm(`Are you sure you want to remove "${item.product_name}"?`)) {
      return;
    }

    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    alert.success('Item removed successfully!', {
      description: `"${item.product_name}" has been removed.`,
      duration: 2000,
    });
  };

  // Update item quantity
  const handleUpdateItemQty = (index, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }

    const newItems = [...items];
    const item = newItems[index];
    item.qty = newQty;
    item.amount = item.qty * item.cost - (item.discount || 0);
    setItems(newItems);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.supplier_id) {
      newErrors.supplier_id = 'Please select a supplier';
    }
    if (items.length === 0) {
      newErrors.items = 'Please add at least one item';
    }
    if (paidAmount < 0) {
      newErrors.paid_amount = 'Paid amount cannot be negative';
    }
    if (paidAmount > total) {
      newErrors.paid_amount = 'Paid amount cannot exceed total amount';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert.warning('Please fix the errors', {
        description: Object.values(newErrors)[0],
      });
      return;
    }

    setErrors({});
    setIsLoading(true);

    const purchaseData = {
      supplier_id: parseInt(formData.supplier_id),
      payment_method: formData.payment_method,
      shipping_cost: safeNumber(formData.shipping_cost) || 0,
      shipping_company: formData.shipping_company || null,
      remark: formData.remark || null,
      status: formData.status,
      paid_amount: safeNumber(paidAmount) || 0,
      items: items.map(item => ({
        product_id: item.product_id,
        qty: item.qty,
        cost: item.cost,
        retail_price: item.retail_price,
        discount: item.discount || 0,
      })),
    };

    try {
      const loadingId = alert.showAlert({
        type: 'info',
        message: isEdit ? 'Updating purchase...' : 'Creating purchase...',
        description: 'Please wait...',
        duration: 0,
        closable: false,
      });

      let res;
      if (isEdit) {
        res = await editPurchase(id, purchaseData);
      } else {
        res = await addPurchase(purchaseData);
      }

      alert.hideAlert(loadingId);

      if (res?.success) {
        alert.success(
          isEdit ? 'Purchase updated successfully!' : 'Purchase created successfully!',
          {
            description: `Purchase order has been ${isEdit ? 'updated' : 'created'}.`,
          }
        );
        navigate('/purchases');
      } else {
        alert.error('Failed to save purchase', {
          description: res?.message || 'Please try again.',
        });
      }
    } catch (error) {
      alert.error('An error occurred while saving', {
        description: error.message || 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/purchases')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
                {isEdit ? 'Edit Purchase' : 'New Purchase'}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {isEdit ? 'Update purchase information' : 'Create a new purchase order'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/purchases')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
          >
            <FiX className="w-4 h-4" />
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
              <FiFileText className="w-4 h-4 text-gray-400" />
              Purchase Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white ${
                      errors.supplier_id ? 'border-red-400' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.supplier_id && (
                  <p className="text-xs text-red-500 mt-1.5">{errors.supplier_id}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Payment Method
                </label>
                <div className="relative">
                  <FiCreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>

              {/* Shipping Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Shipping Cost
                </label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    value={formData.shipping_cost}
                    onChange={(e) => setFormData({ ...formData, shipping_cost: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Shipping Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Shipping Company
                </label>
                <div className="relative">
                  <FiTruck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={formData.shipping_company}
                    onChange={(e) => setFormData({ ...formData, shipping_company: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                    placeholder="Enter shipping company..."
                  />
                </div>
              </div>

              {/* Paid Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Paid Amount
                </label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white ${
                      errors.paid_amount ? 'border-red-400' : 'border-gray-200'
                    }`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                {errors.paid_amount && (
                  <p className="text-xs text-red-500 mt-1.5">{errors.paid_amount}</p>
                )}
                {total > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Total: {formatCurrency(total)} | Remaining: {formatCurrency(total - paidAmount)}
                  </p>
                )}
              </div>
            </div>

            {/* Remark */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Remark
              </label>
              <textarea
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white resize-none"
                placeholder="Enter remark..."
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FiShoppingBag className="w-4 h-4 text-gray-400" />
                  Purchase Items
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{items.length} items added</p>
              </div>
            </div>

            {/* Add Item Form */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                <div className="lg:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={selectedProduct?.name || ''}
                        placeholder="Search product..."
                        readOnly
                        onClick={openProductModal}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none bg-white cursor-pointer"
                      />
                      {selectedProduct && (
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(null)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={openProductModal}
                      className="px-3 py-2 bg-black hover:bg-gray-800 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                    >
                      <FiSearch className="w-4 h-4" />
                      <span className="hidden sm:inline">Find</span>
                    </button>
                  </div>
                  {selectedProduct && (
                    <p className="text-xs text-gray-400 mt-1">
                      Barcode: {selectedProduct.barcode || 'N/A'} | Stock: {safeNumber(selectedProduct.qty)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Qty
                  </label>
                  <input
                    id="itemQty"
                    type="number"
                    value={itemQty}
                    onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none bg-white"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Cost
                  </label>
                  <input
                    type="number"
                    value={itemCost}
                    onChange={(e) => setItemCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none bg-white"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Retail Price
                  </label>
                  <input
                    type="number"
                    value={itemRetailPrice}
                    onChange={(e) => setItemRetailPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none bg-white"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Discount
                  </label>
                  <input
                    type="number"
                    value={itemDiscount}
                    onChange={(e) => setItemDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none bg-white"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all"
                >
                  <FiPlus className="w-4 h-4 inline mr-1" />
                  Add to List
                </button>
                {selectedProduct && (
                  <button
                    type="button"
                    onClick={resetItemForm}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-lg transition-all"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Items List */}
            {items.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                        <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Retail</th>
                        <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Discount</th>
                        <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-2 text-sm">
                            <div>
                              <p className="font-medium text-gray-800">{item.product_name}</p>
                              {item.barcode && (
                                <p className="text-xs text-gray-400">{item.barcode}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-sm text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQty(index, item.qty - 1)}
                                className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                              >
                                <FiMinus className="w-3 h-3 text-gray-600" />
                              </button>
                              <span className="w-8 text-center font-medium">{item.qty}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQty(index, item.qty + 1)}
                                className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                              >
                                <FiPlus className="w-3 h-3 text-gray-600" />
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-sm text-right font-medium">
                            ${safeCurrency(item.cost)}
                          </td>
                          <td className="px-3 py-2 text-sm text-right hidden sm:table-cell">
                            ${safeCurrency(item.retail_price)}
                          </td>
                          <td className="px-3 py-2 text-sm text-right hidden md:table-cell text-red-500">
                            {item.discount > 0 ? `-$${safeCurrency(item.discount)}` : '-'}
                          </td>
                          <td className="px-3 py-2 text-sm text-right font-semibold text-gray-800">
                            ${safeCurrency(item.amount)}
                          </td>
                          <td className="px-3 py-2 text-sm text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                      <tr>
                        <td colSpan="4" className="px-3 py-2"></td>
                        <td className="px-3 py-2 text-right text-sm font-medium text-gray-600 hidden md:table-cell">Subtotal:</td>
                        <td className="px-3 py-2 text-right text-sm font-semibold text-gray-800">
                          ${safeCurrency(subtotal)}
                        </td>
                        <td></td>
                      </tr>
                      <tr>
                        <td colSpan="4" className="px-3 py-2"></td>
                        <td className="px-3 py-2 text-right text-sm font-medium text-gray-600 hidden md:table-cell">Shipping:</td>
                        <td className="px-3 py-2 text-right text-sm font-semibold text-gray-800">
                          ${safeCurrency(formData.shipping_cost || 0)}
                        </td>
                        <td></td>
                      </tr>
                      <tr className="border-t border-gray-300">
                        <td colSpan="4" className="px-3 py-2"></td>
                        <td className="px-3 py-2 text-right text-sm font-bold text-gray-800 hidden md:table-cell">Total:</td>
                        <td className="px-3 py-2 text-right text-sm font-bold text-black">
                          ${safeCurrency(total)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">No items added yet</p>
                <p className="text-xs text-gray-400 mt-1">Search and add products above</p>
              </div>
            )}
            {errors.items && (
              <p className="text-xs text-red-500 mt-2">{errors.items}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/purchases')}
              className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || isLoading}
            >
              {(loading || isLoading) ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  {isEdit ? 'Update Purchase' : 'Create Purchase'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Product Search Modal with Images */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Select Product</h3>
                <p className="text-sm text-gray-500">Search and select a product to add</p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by name or barcode..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                />
                {productSearchTerm && (
                  <button
                    onClick={() => setProductSearchTerm('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Type at least 2 characters to search
              </p>
            </div>

            {/* Product List with Images */}
            <div className="flex-1 overflow-y-auto p-4">
              {productSearchLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
                  <p className="text-sm text-gray-500 mt-3">Searching products...</p>
                </div>
              ) : productSearchTerm.length < 2 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <FiSearch className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-sm font-medium">Type to search</p>
                  <p className="text-xs mt-1">Enter product name or barcode</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <FiPackage className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-sm font-medium">No products found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-black hover:bg-gray-50 transition-all text-left"
                    >
                      {/* Product Image */}
                      <div className="w-14 h-14 flex-shrink-0">
                        <ProductImage
                          image={product.image}
                          alt={product.name}
                          size="md"
                          className="w-14 h-14 rounded-lg border border-gray-200 object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          {product.barcode && <span className="font-mono">{product.barcode}</span>}
                          <span>Stock: {safeNumber(product.qty)}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-800">
                          ${safeCurrency(product.price)}
                        </p>
                        {product.cost && (
                          <p className="text-xs text-gray-400">Cost: ${safeCurrency(product.cost)}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end flex-shrink-0 bg-gray-50">
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="px-5 py-2 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPurchasePage;