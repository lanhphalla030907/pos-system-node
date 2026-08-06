// pages/PosPage.jsx
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

const PosPage = () => {
  // Hooks
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

  // State
  const [cart, setCart] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [memberDiscount, setMemberDiscount] = useState(0);

  // Refs
  const receiptRef = useRef();

  // Print receipt
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

  // Load products on mount
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      loadProducts({ page: 1, limit: 100 });
    }
  }, [loadProducts, isInitialLoad]);

  // Update member discount when customer changes
  useEffect(() => {
    if (selectedCustomer) {
      const discount = parseFloat(selectedCustomer.discount) || 0;
      setMemberDiscount(discount);
    } else {
      setMemberDiscount(0);
    }
  }, [selectedCustomer]);

  // Cart operations
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

  // Handle customer selection
  const handleCustomerSelect = useCallback((customer) => {
    selectCustomer(customer);
  }, [selectCustomer]);

  // Order processing - 
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
        // Prepare receipt data
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
        
        // Reset cart and close modal
        setCart([]);
        setIsCheckoutOpen(false);
        
        // Refresh stock
        await refreshStock();
        
        // Auto print after short delay
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

  return (
    <div className="h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left - Product Grid */}
        <div className="flex-1 p-3">
          <ProductGrid
            products={products}
            loading={loading}
            onProductClick={addToCart}
            memberDiscount={memberDiscount}
          />
        </div>

        {/* Right - Cart */}
        <Cart
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onClear={clearCart}
          onCheckout={openCheckout}
          memberDiscount={memberDiscount}
        />
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

      {/* Hidden Receipt - For Printing */}
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