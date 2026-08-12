
export const calculateOrderTotals = (items) => {
  if (!items || items.length === 0) {
    return {
      subtotal: 0,
      productDiscount: 0,
      memberDiscount: 0,
      totalDiscount: 0,
      finalTotal: 0,
    };
  }

  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const qty = parseFloat(item.qty) || 0;
    return sum + (price * qty);
  }, 0);

  const productDiscount = items.reduce((sum, item) => {
    const discount = parseFloat(item.discount) || 0;
    const price = parseFloat(item.price) || 0;
    const qty = parseFloat(item.qty) || 0;
    return sum + ((price * qty * discount) / 100);
  }, 0);

  const memberDiscount = items.reduce((sum, item) => {
    const memberDisc = parseFloat(item.member_discount) || 0;
    const price = parseFloat(item.price) || 0;
    const qty = parseFloat(item.qty) || 0;
    const productDisc = parseFloat(item.discount) || 0;
    const subtotalItem = price * qty;
    const productDiscAmount = (subtotalItem * productDisc) / 100;
    const afterProductDisc = subtotalItem - productDiscAmount;
    return sum + ((afterProductDisc * memberDisc) / 100);
  }, 0);

  const totalDiscount = productDiscount + memberDiscount;
  const finalTotal = subtotal - totalDiscount;

  return {
    subtotal,
    productDiscount,
    memberDiscount,
    totalDiscount,
    finalTotal,
  };
};

/**
 * Format currency
 */
export const formatCurrency = (amount) => {
  return `$${parseFloat(amount || 0).toFixed(2)}`;
};

/**
 * Format date
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get status badge
 */
export const getStatusBadge = (order) => {
  const paid = parseFloat(order?.paid) || 0;
  const total = parseFloat(order?.total_amount) || 0;
  
  if (paid >= total && total > 0) {
    return { label: 'Paid', color: 'bg-green-100 text-green-800' };
  } else if (paid > 0 && paid < total) {
    return { label: 'Partial', color: 'bg-yellow-100 text-yellow-800' };
  } else if (total === 0) {
    return { label: 'Void', color: 'bg-gray-100 text-gray-600' };
  } else {
    return { label: 'Unpaid', color: 'bg-red-100 text-red-800' };
  }
};

/**
 * Get payment method badge
 */
export const getPaymentBadge = (method) => {
  const methods = {
    cash: { label: 'Cash', color: 'bg-green-100 text-green-800' },
    credit_card: { label: 'Credit Card', color: 'bg-blue-100 text-blue-800' },
    debit_card: { label: 'Debit Card', color: 'bg-purple-100 text-purple-800' },
    mobile_payment: { label: 'Mobile Payment', color: 'bg-indigo-100 text-indigo-800' },
  };

  if (!method) return methods.cash;

  const parts = String(method).split(',').map(s => s.trim()).filter(Boolean);

  if (parts.length > 1) {
    return { label: 'Multiple', color: 'bg-indigo-100 text-indigo-800' };
  }

  const single = parts[0] || method;
  return methods[single.toLowerCase()] || { label: single, color: 'bg-gray-100 text-gray-800' };
};