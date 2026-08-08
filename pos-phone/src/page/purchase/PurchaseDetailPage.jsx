// pages/PurchaseDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { usePurchase } from '../../hooks/usePurchase';
import { formatCurrency, formatDate } from '../../util/orderHelper';

const PurchaseDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { loadPurchaseById, loading } = usePurchase();

  const [purchase, setPurchase] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadPurchase();
  }, [id]);

  const loadPurchase = async () => {
    try {
      setLoadingData(true);
      const res = await loadPurchaseById(id);
      if (res?.success && res.data) {
        setPurchase(res.data);
      } else {
        alert('Purchase not found');
        navigate('/purchases');
      }
    } catch (error) {
      console.error('Error loading purchase:', error);
      alert('Failed to load purchase data');
      navigate('/purchases');
    } finally {
      setLoadingData(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800', dotColor: 'bg-green-500' },
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', dotColor: 'bg-yellow-500' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', dotColor: 'bg-red-500' },
    };
    return statusMap[status] || statusMap.pending;
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Purchase not found</p>
          <Link to="/purchases" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Purchases
          </Link>
        </div>
      </div>
    );
  }

  const status = getStatusBadge(purchase.status);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Purchase Details</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage purchase information</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/purchases"
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Back
            </Link>
            <Link
              to={`/purchases/edit/${purchase.id}`}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Edit Purchase
            </Link>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Info */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{purchase.purchase_no}</h2>
                <p className="text-sm text-gray-500">
                  Supplier: <span className="font-medium">{purchase.supplier?.name || 'N/A'}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                  <span className={`w-2 h-2 rounded-full mr-1.5 ${status.dotColor}`}></span>
                  {status.label}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(purchase.create_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-gray-200">
            <div>
              <p className="text-xs text-gray-500">Total Amount</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(purchase.total_amount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Paid Amount</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(purchase.paid_amount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Remaining</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(purchase.remaining)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Payment Method</p>
              <p className="text-lg font-bold text-gray-800 capitalize">{purchase.payment_method || 'N/A'}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 block">Purchase No</label>
                  <p className="text-gray-900">{purchase.purchase_no}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block">Supplier</label>
                  <p className="text-gray-900">{purchase.supplier?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block">Payment Method</label>
                  <p className="text-gray-900 capitalize">{purchase.payment_method || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block">Shipping Cost</label>
                  <p className="text-gray-900">{formatCurrency(purchase.shipping_cost)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 block">Shipping Company</label>
                  <p className="text-gray-900">{purchase.shipping_company || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block">Paid Date</label>
                  <p className="text-gray-900">{formatDate(purchase.paid_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block">Remark</label>
                  <p className="text-gray-900">{purchase.remark || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block">Created By</label>
                  <p className="text-gray-900">{purchase.create_by || 'System'}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase Items</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Retail Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {purchase.items?.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            {item.barcode && (
                              <p className="text-xs text-gray-400">{item.barcode}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm text-center">{item.qty}</td>
                        <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.cost)}</td>
                        <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.retail_price)}</td>
                        <td className="px-4 py-2 text-sm text-right text-red-600">
                          {item.discount > 0 ? formatCurrency(item.discount) : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm text-right font-semibold">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan="4" className="px-4 py-2"></td>
                      <td className="px-4 py-2 text-right text-sm font-medium">Subtotal:</td>
                      <td className="px-4 py-2 text-right text-sm font-semibold">
                        {formatCurrency(purchase.total_amount - (purchase.shipping_cost || 0))}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="4" className="px-4 py-2"></td>
                      <td className="px-4 py-2 text-right text-sm font-medium">Shipping:</td>
                      <td className="px-4 py-2 text-right text-sm font-semibold">
                        {formatCurrency(purchase.shipping_cost)}
                      </td>
                    </tr>
                    <tr className="border-t border-gray-300">
                      <td colSpan="4" className="px-4 py-2"></td>
                      <td className="px-4 py-2 text-right text-sm font-bold">Total:</td>
                      <td className="px-4 py-2 text-right text-sm font-bold text-blue-600">
                        {formatCurrency(purchase.total_amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetailPage;