// pages/PosPage.jsx - With Payment Components
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import useProduct from '../hooks/useProduct';
import { useOrder } from '../hooks/useOrder';
import { useCustomer } from '../hooks/useCustomer';
import ProductGrid from '../components/pos/ProductGrid';
import Cart from '../components/pos/Cart';
import Receipt from '../components/pos/Receipt';
import PaymentRow from '../components/pos/PaymentRow';
import { prepareOrderItems, calculateCartTotals } from '../util/cartHelpers';
import { FiRefreshCw, FiShoppingCart, FiX, FiPlus, FiUser, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAlert } from '../components/common/Alert';
import { useConfirm } from '../hooks/useConfirm';
import ConfirmModal from '../components/common/ConfirmModal';
import { usePaymentMethod } from '../hooks/usePaymentMethod';

let rowKey = 0;

const newRow = (methods, totalAmount = 0) => ({
  key: `pm-${Date.now()}-${rowKey++}`,
  payment_method_id: methods.length > 0 ? methods[0].id : '',
  amount: totalAmount > 0 ? totalAmount.toFixed(2) : '',
  reference_no: '',
  isAutoFilled: true,
});

const PosPage = () => {
  const { products, loading, loadProducts, refreshStock } = useProduct();
  const { saveOrder, loading: orderLoading } = useOrder();
  const { 
    customers, 
    loading: customersLoading, 
    loadCustomers, 
    addCustomer,
    selectedCustomer,
    selectCustomer 
  } = useCustomer();

  const { paymentMethods, loadPaymentMethods } = usePaymentMethod();
  
  const alert = useAlert();
  const { showConfirm, config, setLoading: setConfirmLoading } = useConfirm();

  const [cart, setCart] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [memberDiscount, setMemberDiscount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [payments, setPayments] = useState([]);
  const [paymentError, setPaymentError] = useState('');
  const [searchCustomerTerm, setSearchCustomerTerm] = useState('');
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    tel: '',
    email: '',
    address: ''
  });

  const receiptRef = useRef();

  const printReceipt = useReactToPrint({
    contentRef: receiptRef,
    onAfterPrint: () => {
      setShowReceipt(false);
      setLastOrder(null);
    },
    onPrintError: (error) => {
      console.error('Print error:', error);
      alert.error('Failed to print receipt', {
        description: 'Please try again or print manually.',
      });
      setShowReceipt(false);
    }
  });

  // Load data on mount
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      loadProducts({ page: 1, limit: 100 });
      loadCustomers();
      loadPaymentMethods();
    }
  }, [loadProducts, loadCustomers, loadPaymentMethods, isInitialLoad]);

  // Update member discount when customer changes
  useEffect(() => {
    if (selectedCustomer) {
      const discount = parseFloat(selectedCustomer.discount) || 0;
      setMemberDiscount(discount);
    } else {
      setMemberDiscount(0);
    }
  }, [selectedCustomer]);

  // Initialize payment when checkout mode opens
  useEffect(() => {
    if (isCheckoutMode && paymentMethods.length > 0 && payments.length === 0) {
      const totals = calculateCartTotals(cart, memberDiscount);
      setPayments([newRow(paymentMethods, totals.total)]);
    }
  }, [isCheckoutMode, paymentMethods, cart, memberDiscount]);

  // Cart operations
  const addToCart = useCallback((product) => {
    if (!product) return;
    
    const stock = parseInt(product?.qty) || 0;
    if (stock === 0) {
      alert.warning('Product is out of stock!');
      return;
    }
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item?.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= stock) {
          alert.warning(`Only ${stock} units available!`);
          return prevCart;
        }
        alert.success(`Added another "${product.name}" to cart!`);
        return prevCart.map(item =>
          item?.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      alert.success(`"${product.name}" added to cart!`);
      return [...prevCart, { ...product, quantity: 1 }];
    });
    
    if (window.innerWidth < 768) {
      setIsCartOpen(true);
    }
  }, [alert]);

  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => prevCart.filter(item => item?.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const product = cart.find(item => item?.id === productId);
    const stock = parseInt(product?.qty) || 0;
    
    if (newQuantity > stock) {
      alert.warning(`Only ${stock} units available!`);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item?.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  }, [cart, removeFromCart, alert]);

  const clearCart = useCallback(async () => {
    if (cart.length === 0) return;

    const confirmed = await showConfirm({
      title: 'Clear Cart',
      message: 'Are you sure you want to clear all items?',
      confirmText: 'Clear Cart',
      cancelText: 'Cancel',
      type: 'warning',
      icon: FiShoppingCart,
    });

    if (!confirmed) return;

    setCart([]);
    setIsCartOpen(false);
    alert.success('Cart cleared!');
  }, [cart, showConfirm, alert]);

  // Payment methods
  const updatePaymentRow = useCallback((key, field, value) => {
    setPayments((prev) =>
      prev.map((row) => {
        if (row.key === key) {
          if (field === 'amount') {
            return { ...row, [field]: value, isAutoFilled: false };
          }
          return { ...row, [field]: value };
        }
        return row;
      }),
    );
    setPaymentError('');
  }, []);

  const addPaymentRow = useCallback(() => {
    const totals = calculateCartTotals(cart, memberDiscount);
    const totalAmount = totals.total;
    setPayments((prev) => {
      if (prev.length >= paymentMethods.length) return prev;
      const totalPaid = prev.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
      const remaining = Math.round((totalAmount - totalPaid + Number.EPSILON) * 100) / 100;
      const newRowData = newRow(paymentMethods, remaining > 0 ? remaining : 0);
      return [...prev, newRowData];
    });
    setPaymentError('');
  }, [paymentMethods, cart, memberDiscount]);

  const removePaymentRow = useCallback((key) => {
    setPayments((prev) => {
      const newPayments = prev.filter((row) => row.key !== key);
      if (newPayments.length === 0) {
        const totals = calculateCartTotals(cart, memberDiscount);
        return [newRow(paymentMethods, totals.total)];
      }
      return newPayments;
    });
    setPaymentError('');
  }, [paymentMethods, cart, memberDiscount]);

  // Customer functions
  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchCustomerTerm.toLowerCase()) ||
    c.tel?.includes(searchCustomerTerm)
  );

  const handleSelectCustomer = (customer) => {
    selectCustomer(customer);
    setSearchCustomerTerm('');
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim()) {
      alert('Customer name is required');
      return;
    }

    const res = await addCustomer(newCustomer);
    if (res?.success) {
      setIsCreatingCustomer(false);
      setNewCustomer({ name: '', tel: '', email: '', address: '' });
      selectCustomer(res.data);
    } else {
      alert(res?.message || 'Failed to create customer');
    }
  };

  // Calculate totals
  const totals = calculateCartTotals(cart, memberDiscount);
  const totalAmount = totals.total;

  const totalPaid = Math.round((payments.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0) + Number.EPSILON) * 100) / 100;
  const remaining = Math.round((totalAmount - totalPaid + Number.EPSILON) * 100) / 100;

  // Get used payment method IDs
  const usedIds = payments
    .map((row) => Number(row.payment_method_id))
    .filter(Boolean);

  // Handle checkout
  const openCheckout = () => {
    if (cart.length === 0) {
      alert.warning('Cart is empty!');
      return;
    }
    setIsCheckoutMode(true);
    setIsCartOpen(false);
  };

  const closeCheckout = () => {
    setIsCheckoutMode(false);
    setPayments([]);
    setPaymentError('');
    setSearchCustomerTerm('');
  };

  // Handle confirm order
  const handleConfirmOrder = async () => {
    if (!selectedCustomer) {
      setPaymentError('Please select a customer');
      return;
    }

    if (payments.length === 0) {
      setPaymentError('Please add at least one payment method');
      return;
    }

    for (const row of payments) {
      if (!row.payment_method_id) {
        setPaymentError('Please select a payment method');
        return;
      }
      const amount = parseFloat(row.amount);
      if (!amount || amount <= 0) {
        setPaymentError('Payment amount must be greater than 0');
        return;
      }
    }

    if (remaining > 0.01) {
      setPaymentError(`Total paid ($${totalPaid.toFixed(2)}) is less than total ($${totalAmount.toFixed(2)})`);
      return;
    }

    const payload = {
      customer_id: selectedCustomer.id,
      payments: payments.map((row) => ({
        payment_method_id: Number(row.payment_method_id),
        amount: parseFloat(row.amount),
        reference_no: row.reference_no?.trim() || undefined,
      })),
      remark: selectedCustomer?.name || 'Walk-in Customer',
      items: prepareOrderItems(cart, memberDiscount),
    };

    try {
      const res = await saveOrder(payload);
      
      if (res?.success) {
        const receiptData = {
          ...res.data,
          order_no: res.data?.order_no || `ORD-${String(res.data?.id || Date.now()).padStart(6, '0')}`,
          customer_name: selectedCustomer?.name || 'Walk-in Customer',
          customer_tel: selectedCustomer?.tel || '',
          subtotal: totals.subtotal,
          total_product_discount: totals.totalProductDiscount,
          total_member_discount: totals.totalMemberDiscount,
          total_discount: totals.totalDiscount,
          total_amount: totalAmount,
          paid: totalPaid,
          cashier: 'Admin',
          created_at: new Date().toISOString(),
          items: cart.map(item => ({
            product_name: item.name,
            product_id: item.id,
            qty: item.quantity,
            price: parseFloat(item.price) || 0,
            discount: parseFloat(item.discount) || 0,
            member_discount: memberDiscount,
            discount_amount: (parseFloat(item.price) * item.quantity * (parseFloat(item.discount) || 0) / 100) + 
                           (((parseFloat(item.price) * item.quantity) - (parseFloat(item.price) * item.quantity * (parseFloat(item.discount) || 0) / 100)) * memberDiscount / 100),
            total: item.quantity * (parseFloat(item.price) || 0) - 
                   (parseFloat(item.price) * item.quantity * (parseFloat(item.discount) || 0) / 100) -
                   (((parseFloat(item.price) * item.quantity) - (parseFloat(item.price) * item.quantity * (parseFloat(item.discount) || 0) / 100)) * memberDiscount / 100)
          }))
        };

        setLastOrder(receiptData);
        setShowReceipt(true);
        
        setCart([]);
        setIsCheckoutMode(false);
        setPayments([]);
        setIsCartOpen(false);
        
        await refreshStock();
        
        alert.success(`Order #${receiptData.order_no} created successfully!`);

        setTimeout(() => {
          printReceipt();
        }, 500);
      } else {
        alert.error('Failed to create order', {
          description: res?.message || 'Please try again.',
        });
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert.error('An error occurred while processing the order');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header - Same as before */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="md:hidden relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiShoppingCart className="w-5 h-5 text-gray-600" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-gray-800">Point of Sale</h1>
            <p className="text-xs text-gray-400 hidden sm:block">Process customer orders</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedCustomer && (
            <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full hidden sm:inline-block">
              {selectedCustomer.name}
            </span>
          )}
          <button
            onClick={() => {
              loadProducts({ page: 1, limit: 100 });
              alert.success('Products refreshed!');
            }}
            className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-600 text-xs sm:text-sm font-medium rounded-lg border border-gray-200 transition-colors"
          >
            <FiRefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link to="/today-sale">
          <button className='inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-600 text-xs sm:text-sm font-medium rounded-lg border border-gray-200 transition-colors'>Today's Sale</button>
          </Link>
          {isCheckoutMode && (
            <button
              onClick={closeCheckout}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors"
            >
              <FiX className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Product Grid */}
        <div className={`flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 ${isCartOpen ? 'hidden md:block' : 'block'}`}>
          <ProductGrid
            products={products}
            loading={loading}
            onProductClick={addToCart}
            memberDiscount={memberDiscount}
          />
        </div>

        {/* Checkout Panel - When in checkout mode */}
        {isCheckoutMode ? (
          <div className="w-full md:w-[550px] flex-shrink-0 h-full bg-white shadow-lg flex flex-col border-l border-gray-200">
            {/* Checkout Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Checkout</h2>
                <p className="text-xs text-gray-500">Complete your purchase</p>
              </div>
              <button
                onClick={closeCheckout}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Customer Selection - Same as before */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Customer
                </label>
                {!isCreatingCustomer ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search customer by name or phone..."
                        value={searchCustomerTerm}
                        onChange={(e) => setSearchCustomerTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                      />
                    </div>

                    {selectedCustomer ? (
                      <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between border border-gray-200">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{selectedCustomer.name}</p>
                          <p className="text-xs text-gray-500">{selectedCustomer.tel}</p>
                          <p className="text-xs text-gray-400">
                            {selectedCustomer.type || 'Regular'} • {selectedCustomer.discount || 0}% off
                          </p>
                        </div>
                        <button
                          onClick={() => selectCustomer(null)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Change
                        </button>
                      </div>
                    ) : searchCustomerTerm && (
                      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                        {customersLoading ? (
                          <div className="p-2 text-center text-gray-500">Loading...</div>
                        ) : filteredCustomers.length === 0 ? (
                          <div className="p-2 text-center">
                            <p className="text-sm text-gray-500">No customers found</p>
                            <button
                              onClick={() => setIsCreatingCustomer(true)}
                              className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                            >
                              Create new customer
                            </button>
                          </div>
                        ) : (
                          filteredCustomers.map((customer) => (
                            <div
                              key={customer.id}
                              onClick={() => handleSelectCustomer(customer)}
                              className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            >
                              <p className="text-sm font-medium">{customer.name}</p>
                              <p className="text-xs text-gray-500">{customer.tel}</p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    {!selectedCustomer && !searchCustomerTerm && (
                      <button
                        onClick={() => setIsCreatingCustomer(true)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        + Create new customer
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">New Customer</h4>
                    <input
                      type="text"
                      placeholder="Name *"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={newCustomer.tel}
                      onChange={(e) => setNewCustomer({ ...newCustomer, tel: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Address"
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsCreatingCustomer(false)}
                        className="flex-1 px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateCustomer}
                        className="flex-1 px-3 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                )}
                {memberDiscount > 0 && selectedCustomer && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                    <FiCheckCircle className="w-3.5 h-3.5" />
                    Member Discount: {memberDiscount}% applied!
                  </div>
                )}
              </div>

              {/* Payment Methods - Using Components */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Methods
                </label>

                {paymentMethods.length === 0 ? (
                  <div className="text-xs text-gray-400 border border-gray-200 rounded-lg p-3 text-center">
                    No active payment methods available.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((row, index) => (
                      <PaymentRow
                        key={row.key}
                        row={row}
                        index={index}
                        paymentMethods={paymentMethods}
                        usedIds={usedIds}
                        onUpdate={updatePaymentRow}
                        onRemove={removePaymentRow}
                        isRemovable={payments.length > 1}
                        totalAmount={totalAmount}
                      />
                    ))}
                  </div>
                )}

                <button
                  onClick={addPaymentRow}
                  disabled={payments.length >= paymentMethods.length}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-black border border-gray-200 hover:border-gray-300 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Payment Method
                </button>

                {/* Payment Totals */}
                <div className="mt-4 space-y-1.5 border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Paid</span>
                    <span className={`font-semibold ${
                      Math.abs(totalPaid - totalAmount) < 0.01
                        ? 'text-emerald-600'
                        : totalPaid > totalAmount
                          ? 'text-blue-600'
                          : 'text-orange-500'
                    }`}>
                      ${totalPaid.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total</span>
                    <span className="font-semibold text-gray-700">${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Change</span>
                    <span className={`font-bold ${
                      remaining < -0.01
                        ? 'text-emerald-600'
                        : 'text-gray-400'
                    }`}>
                      ${remaining < -0.01 ? Math.abs(remaining).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Remaining</span>
                    <span className={`font-bold ${
                      Math.abs(remaining) < 0.01
                        ? 'text-emerald-600'
                        : remaining > 0
                          ? 'text-orange-500'
                          : 'text-emerald-600'
                    }`}>
                      ${remaining < 0 ? '0.00' : remaining.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Items ({totals.totalItems})</span>
                  <span className="text-gray-700">${totals.subtotal.toFixed(2)}</span>
                </div>
                {totals.totalProductDiscount > 0 && (
                  <div className="flex justify-between text-sm text-red-500 mb-1">
                    <span>Product Discount</span>
                    <span>-${totals.totalProductDiscount.toFixed(2)}</span>
                  </div>
                )}
                {totals.totalMemberDiscount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-500 mb-1">
                    <span>Member Discount</span>
                    <span>-${totals.totalMemberDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-700">Total</span>
                  <span className="text-black">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Error */}
              {paymentError && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  <FiCheckCircle className="w-3.5 h-3.5" />
                  {paymentError}
                </div>
              )}
            </div>

            {/* Checkout Actions */}
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={handleConfirmOrder}
                disabled={orderLoading}
                className="w-full px-4 py-3 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {orderLoading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="w-4 h-4" />
                    Pay Now
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Cart - When not in checkout mode */
          <div className="hidden md:block flex-shrink-0 h-full">
            <Cart
              cart={cart}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
              onClear={clearCart}
              onCheckout={openCheckout}
              memberDiscount={memberDiscount}
            />
          </div>
        )}
      </div>

      {/* Mobile Cart Overlay - Same as before */}
      <div className={`
        md:hidden fixed inset-0 z-40 transition-transform duration-300 ease-in-out
        ${isCartOpen && !isCheckoutMode ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsCartOpen(false)}></div>
        <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl">
          <Cart
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            onClear={clearCart}
            onCheckout={openCheckout}
            memberDiscount={memberDiscount}
            onClose={() => setIsCartOpen(false)}
          />
        </div>
      </div>

      {/* Hidden Receipt */}
      {showReceipt && lastOrder && (
        <div className="hidden">
          <Receipt
            ref={receiptRef}
            order={lastOrder}
            shopInfo={{
              name: 'POS SHOP',
              tel: '012 345 678',
              address: 'Phnom Penh, Cambodia'
            }}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={config.isOpen}
        onClose={config.onCancel || (() => {})}
        onConfirm={config.onConfirm}
        title={config.title}
        message={config.message}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        type={config.type}
        icon={config.icon}
        loading={config.loading}
      />
    </div>
  );
};

export default PosPage;