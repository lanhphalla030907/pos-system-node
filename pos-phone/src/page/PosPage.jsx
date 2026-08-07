// pages/PosPage.jsx - Fully Responsive
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import useProduct from '../hooks/useProduct';
import { useOrder } from '../hooks/useOrder';
import { useCustomer } from '../hooks/useCustomer';
import ProductGrid from '../components/pos/ProductGrid';
import Cart from '../components/pos/Cart';
import CheckoutModal from '../components/pos/CheckoutModal';
import Receipt from '../components/pos/Receipt';
import { prepareOrderItems, calculateCartTotals } from '../util/cartHelpers';
import { FiRefreshCw, FiShoppingCart, FiMenu } from 'react-icons/fi';

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

  const [cart, setCart] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [memberDiscount, setMemberDiscount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const receiptRef = useRef();

  const printReceipt = useReactToPrint({
    contentRef: receiptRef,
    onAfterPrint: () => {
      setShowReceipt(false);
      setLastOrder(null);
    },
    onPrintError: (error) => {
      console.error('Print error:', error);
      alert('Failed to print receipt. Please try again or print manually.');
      setShowReceipt(false);
    }
  });

  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      loadProducts({ page: 1, limit: 100 });
    }
  }, [loadProducts, isInitialLoad]);

  useEffect(() => {
    if (selectedCustomer) {
      const discount = parseFloat(selectedCustomer.discount) || 0;
      setMemberDiscount(discount);
    } else {
      setMemberDiscount(0);
    }
  }, [selectedCustomer]);

  const addToCart = useCallback((product) => {
    if (!product) return;
    
    const stock = parseInt(product?.qty) || 0;
    if (stock === 0) {
      alert('Product is out of stock!');
      return;
    }
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item?.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= stock) {
          alert(`Only ${stock} units available in stock!`);
          return prevCart;
        }
        return prevCart.map(item =>
          item?.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    
    // Auto open cart on mobile when adding items
    if (window.innerWidth < 768) {
      setIsCartOpen(true);
    }
  }, []);

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
      alert(`Only ${stock} units available in stock!`);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item?.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  }, [cart, removeFromCart]);

  const clearCart = useCallback(() => {
    if (window.confirm('Clear all items from cart?')) {
      setCart([]);
      setIsCartOpen(false);
    }
  }, []);

  const openCheckout = useCallback(() => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    setIsCheckoutOpen(true);
  }, [cart]);

  const closeCheckout = useCallback(() => {
    setIsCheckoutOpen(false);
  }, []);

  const handleCustomerSelect = useCallback((customer) => {
    selectCustomer(customer);
  }, [selectCustomer]);

  const handleConfirmOrder = useCallback(async (orderData) => {
    const totals = calculateCartTotals(cart, memberDiscount);
    
    const payload = {
      customer_id: orderData.customer_id,
      total_amount: totals.total,  
      paid: orderData.paid_amount,
      payment_method: orderData.payment_method,
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
          paid: orderData.paid_amount,
          total_amount: totals.total,
          subtotal: totals.subtotal,
          total_product_discount: totals.totalProductDiscount,
          total_member_discount: totals.totalMemberDiscount,
          total_discount: totals.totalDiscount,
          payment_method: orderData.payment_method,
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
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
        
        await refreshStock();
        
        setTimeout(() => {
          printReceipt();
        }, 500);
      } else {
        alert(res?.message || 'Failed to create order. Please try again.');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('An error occurred while processing the order. Please try again.');
    }
  }, [cart, selectedCustomer, memberDiscount, saveOrder, refreshStock, printReceipt]);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleCart}
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
            onClick={() => loadProducts({ page: 1, limit: 100 })}
            className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-600 text-xs sm:text-sm font-medium rounded-lg border border-gray-200 transition-colors"
          >
            <FiRefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Product Grid */}
        <div className={`flex-1 p-2 sm:p-3 md:p-4 overflow-y-auto ${isCartOpen ? 'hidden md:block' : 'block'}`}>
          <ProductGrid
            products={products}
            loading={loading}
            onProductClick={addToCart}
            memberDiscount={memberDiscount}
          />
        </div>

        {/* Cart - Desktop */}
        <div className={`hidden md:block flex-shrink-0`}>
          <Cart
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            onClear={clearCart}
            onCheckout={openCheckout}
            memberDiscount={memberDiscount}
          />
        </div>

        {/* Cart - Mobile Overlay */}
        <div className={`
          md:hidden fixed inset-0 z-40 transition-transform duration-300 ease-in-out
          ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="absolute inset-0 bg-black/50" onClick={toggleCart}></div>
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl">
            <Cart
              cart={cart}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
              onClear={clearCart}
              onCheckout={openCheckout}
              memberDiscount={memberDiscount}
              onClose={toggleCart}
            />
          </div>
        </div>

        {/* Mobile Cart Button - Fixed */}
        {cart.length > 0 && !isCartOpen && (
          <button
            onClick={toggleCart}
            className="md:hidden fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-lg z-30 flex items-center gap-2"
          >
            <FiShoppingCart className="w-6 h-6" />
            <span className="text-sm font-medium">{cart.length}</span>
          </button>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={closeCheckout}
        cart={cart}
        onConfirm={handleConfirmOrder}
        loading={orderLoading}
        selectedCustomer={selectedCustomer}
        onCustomerSelect={handleCustomerSelect}
        memberDiscount={memberDiscount}
        customers={customers}
        customersLoading={customersLoading}
        loadCustomers={loadCustomers}
        addCustomer={addCustomer}
      />

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
    </div>
  );
};

export default PosPage;