// utils/cartHelpers.js

/**
 * Calculate discounted price for a single product
 * @param {Object} product - Product object
 * @param {number} memberDiscount - Member discount percentage (from customer)
 * @returns {Object} - Discount calculations
 */
export const calculateProductDiscount = (product, memberDiscount = 0) => {
  const price = parseFloat(product.price) || 0;
  const quantity = product.quantity || 1;
  const productDiscount = parseFloat(product.discount) || 0;
  
  const subtotal = price * quantity;
  const productDiscountAmount = (subtotal * productDiscount) / 100;
  const afterProductDiscount = subtotal - productDiscountAmount;
  const memberDiscountAmount = (afterProductDiscount * memberDiscount) / 100;
  const totalDiscount = productDiscountAmount + memberDiscountAmount;
  const finalTotal = subtotal - totalDiscount;

  return {
    subtotal,
    productDiscount,
    productDiscountAmount,
    memberDiscount,
    memberDiscountAmount,
    totalDiscount,
    finalTotal,
    price: finalTotal / quantity,
  };
};

/**
 * Calculate cart totals with member discount
 * ✅ លុប Tax ចេញទាំងស្រុង!
 */
export const calculateCartTotals = (cart, memberDiscount = 0) => {
  let totalItems = 0;
  let subtotal = 0;
  let totalProductDiscount = 0;
  let totalMemberDiscount = 0;
  let totalDiscount = 0;
  let total = 0;

  cart.forEach(item => {
    const calc = calculateProductDiscount(item, memberDiscount);
    totalItems += item.quantity || 0;
    subtotal += calc.subtotal;
    totalProductDiscount += calc.productDiscountAmount;
    totalMemberDiscount += calc.memberDiscountAmount;
    totalDiscount += calc.totalDiscount;
    total += calc.finalTotal;
  });

  // ❌ លុប Tax ចេញ!
  // const tax = total * 0.1;
  // const grandTotal = total + tax;

  return {
    totalItems,
    subtotal,
    totalProductDiscount,
    totalMemberDiscount,
    totalDiscount,
    total,        // ✅ នេះជា Total ពិតប្រាកដ
  };
};

/**
 * Prepare order items for API
 */
export const prepareOrderItems = (cart, memberDiscount = 0) => {
  return cart.map(item => {
    const calc = calculateProductDiscount(item, memberDiscount);
    return {
      product_id: item.id,
      qty: item.quantity,
      price: parseFloat(item.price) || 0,
      discount: parseFloat(item.discount) || 0,
      member_discount: memberDiscount,
      discount_amount: calc.totalDiscount,
      total: calc.finalTotal,
      product_name: item.name,
      subtotal: calc.subtotal,
      product_discount_amount: calc.productDiscountAmount,
      member_discount_amount: calc.memberDiscountAmount,
    };
  });
};

// Keep old function for backward compatibility
export const getDiscountedPrice = (product) => {
  if (!product) return 0;
  const price = parseFloat(product.price) || 0;
  const discount = parseFloat(product.discount) || 0;
  return discount > 0 ? price - (price * discount / 100) : price;
};