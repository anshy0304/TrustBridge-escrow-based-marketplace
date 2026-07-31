import { useEffect, useState } from "react";
import { X, CheckCircle, Clock, AlertCircle } from "lucide-react";
import api from "../api";

export default function ProductDetailsModal({ product, onClose }) {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await api.get(`/products/${product.id}/purchases`);
        setPurchases(res.data);
      } catch (err) {
        setError("Failed to load purchase history");
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [product.id]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'RELEASED': return <CheckCircle className="h-4 w-4 text-green-500 mr-1" />;
      case 'IN_DISPUTE': return <AlertCircle className="h-4 w-4 text-red-500 mr-1" />;
      default: return <Clock className="h-4 w-4 text-yellow-500 mr-1" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4 z-10">
            <button
              type="button"
              className="bg-white rounded-md text-slate-400 hover:text-slate-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-2xl leading-6 font-bold text-slate-900" id="modal-title">
                {product?.title}
              </h3>
              
              <div className="mt-4 flex justify-between items-center border-b border-slate-200 pb-4">
                <div>
                  <p className="text-sm text-slate-500">Seller</p>
                  <p className="font-medium text-slate-900">{product?.seller?.email}</p>
                  <p className="text-xs text-slate-400">
                    {product?.seller?.verified ? 'Verified ✓' : 'Unverified'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Price</p>
                  <p className="text-2xl font-bold text-slate-900">₹{parseFloat(product?.price || 0).toFixed(2)}</p>
                </div>
              </div>

              {product?.purchaseCount > 0 && (
                <div className="mt-4">
                  <h4 className="text-lg font-medium text-slate-900 mb-2">Purchase History</h4>
                  {loading ? (
                    <div className="text-center py-4 text-sm text-slate-500">Loading history...</div>
                  ) : error ? (
                    <div className="text-center py-4 text-sm text-red-500">{error}</div>
                  ) : (
                    <div className="mt-2 flex flex-col">
                      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                          <div className="shadow overflow-hidden border-b border-slate-200 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-slate-200">
                              <thead className="bg-slate-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Buyer
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Date
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Escrow Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-slate-200">
                                {purchases.map((purchase) => (
                                  <tr key={purchase.transactionId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                      {purchase.buyer.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                      {new Date(purchase.purchasedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 flex items-center">
                                      {getStatusIcon(purchase.status)}
                                      {purchase.status}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
