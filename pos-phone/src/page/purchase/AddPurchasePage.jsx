// pages/AddPurchasePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePurchase } from '../hooks/usePurchase';
import { useSupplier } from '../hooks/useSupplier';
import { useProduct } from '../hooks/useProduct';
import { formatCurrency } from '../util/orderHelper';

const AddPurchasePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

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

  const hasLoaded = useRef(false);

  // Load data on mount
  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadSuppliers({ status: 1 });
      loadProducts({ page: 1, limit: 100 });
    }
  }, [loadSuppliers, loadProducts]);

  // Load purchase data if editing
  useEffect(() => {
    if (isEdit) {
      loadPurchase();
    }
  }, [isEdit]);

  const loadPurchase = async () => {
    try {
      const res = await loadPurchaseById(id);
      if (res?.success && res.data) {
        const data = res.data;
        setFormData({
          supplier_id: data.supplier?.id || '',
          payment_method: data.payment_method || 'cash',
          shipping_cost: data.shipping_cost || 0,
          shipping_company: data.shipping_company || '',
          remark: data.remark || '',
          status: data.status || 'completed',
        });
        setItems(data.items || []);
        setPaidAmount(data.paid_amount || 0);
      }
    } catch (error) {
      console.error('Error loading purchase:', error);
      alert('Failed to load purchase data');
    }
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.qty * item.cost - (item.discount || 0)), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + (parseFloat(formData.shipping_cost) || 0);
  };

  const subtotal = calculateSubtotal();
  const total = calculateTotal();

  // Add item to list
  const handleAddItem = () => {
    if (!selectedProduct) {
      alert('Please select a product');
      return;
    }

    if (itemQty <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    if (itemCost < 0) {
      alert('Cost cannot be negative');
      return;
    }

    const existingItem = items.find(item => item.product_id === selectedProduct.id);
    if (existingItem) {
      alert('Product already added. Please update quantity in the list.');
      return;
    }

    const newItem = {
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      barcode: selectedProduct.barcode,
      qty: itemQty,
      cost: itemCost,
      retail_price: itemRetailPrice || selectedProduct.price || 0,
      discount: itemDiscount || 0,
      amount: itemQty * itemCost - (itemDiscount || 0),
    };

    setItems([...items, newItem]);
    resetItemForm();
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
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
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

    // Validate
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
      return;
    }

    setErrors({});
    setIsLoading(true);

    const purchaseData = {
      supplier_id: parseInt(formData.supplier_id),
      payment_method: formData.payment_method,
      shipping_cost: parseFloat(formData.shipping_cost) || 0,
      shipping_company: formData.shipping_company || null,
      remark: formData.remark || null,
      status: formData.status,
      paid_amount: parseFloat(paidAmount) || 0,
      items: items.map(item => ({
        product_id: item.product_id,
        qty: item.qty,
        cost: item.cost,
        retail_price: item.retail_price,
        discount: item.discount || 0,
      })),
    };

    let res;
    if (isEdit) {
      res = await editPurchase(id, purchaseData);
    } else {
      res = await addPurchase(purchaseData);
    }

    if (res?.success) {
      alert(isEdit ? 'Purchase updated successfully!' : 'Purchase created successfully!');
      navigate('/purchases');
    } else {
      alert(res?.message || 'Failed to save purchase');
    }

    setIsLoading(false);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    };
    return statusMap[status] || statusMap.pending;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isEdit ? 'Edit Purchase' : 'Add New Purchase'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit ? 'Update purchase information' : 'Create a new purchase order'}
            </p>
          </div>
          <button
            onClick={() => navigate('/purchases')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier *
                </label>
                <select
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none bg-white ${
                    errors.supplier_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                {errors.supplier_id && (
                  <p className="text-xs text-red-500 mt-1">{errors.supplier_id}</p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none bg-white"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none bg-white"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Shipping Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Cost
                </label>
                <input
                  type="number"
                  value={formData.shipping_cost}
                  onChange={(e) => setFormData({ ...formData, shipping_cost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              {/* Shipping Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Company
                </label>
                <input
                  type="text"
                  value={formData.shipping_company}
                  onChange={(e) => setFormData({ ...formData, shipping_company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none"
                  placeholder="Enter shipping company..."
                />
              </div>

              {/* Paid Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paid Amount
                </label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none ${
                    errors.paid_amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {errors.paid_amount && (
                  <p className="text-xs text-red-500 mt-1">{errors.paid_amount}</p>
                )}
                {total > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Total: {formatCurrency(total)} | Remaining: {formatCurrency(total - paidAmount)}
                  </p>
                )}
              </div>

              {/* Remark */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remark
                </label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none"
                  placeholder="Enter remark..."
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Purchase Items</h3>
              <span className="text-sm text-gray-500">{items.length} items</span>
            </div>

            {/* Add Item Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Product *
                </label>
                <select
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const product = products.find(p => p.id === parseInt(e.target.value));
                    setSelectedProduct(product);
                    if (product) {
                      setItemCost(product.cost || 0);
                      setItemRetailPrice(product.price || 0);
                    }
                  }}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none bg-white"
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} {product.barcode ? `(${product.barcode})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Qty
                </label>
                <input
                  type="number"
                  value={itemQty}
                  onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none"
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
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none"
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
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none"
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
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition"
                >
                  Add Item
                </button>
              </div>
            </div>

            {/* Items List */}
            {items.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Retail</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
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
                              className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQty(index, item.qty + 1)}
                              className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-sm text-right">{formatCurrency(item.cost)}</td>
                        <td className="px-3 py-2 text-sm text-right">{formatCurrency(item.retail_price)}</td>
                        <td className="px-3 py-2 text-sm text-right text-red-600">
                          {item.discount > 0 ? formatCurrency(item.discount) : '-'}
                        </td>
                        <td className="px-3 py-2 text-sm text-right font-semibold">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="px-3 py-2 text-sm text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan="4" className="px-3 py-2"></td>
                      <td className="px-3 py-2 text-right text-sm font-medium">Subtotal:</td>
                      <td className="px-3 py-2 text-right text-sm font-semibold">
                        {formatCurrency(subtotal)}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan="4" className="px-3 py-2"></td>
                      <td className="px-3 py-2 text-right text-sm font-medium">Shipping:</td>
                      <td className="px-3 py-2 text-right text-sm font-semibold">
                        {formatCurrency(formData.shipping_cost || 0)}
                      </td>
                      <td></td>
                    </tr>
                    <tr className="border-t border-gray-300">
                      <td colSpan="4" className="px-3 py-2"></td>
                      <td className="px-3 py-2 text-right text-sm font-bold">Total:</td>
                      <td className="px-3 py-2 text-right text-sm font-bold text-blue-600">
                        {formatCurrency(total)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm">No items added yet</p>
                <p className="text-xs">Add products above</p>
              </div>
            )}
            {errors.items && (
              <p className="text-xs text-red-500 mt-2">{errors.items}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/purchases')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2 disabled:opacity-50"
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
                isEdit ? 'Update Purchase' : 'Create Purchase'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPurchasePage;