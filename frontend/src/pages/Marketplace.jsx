import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Plus } from "lucide-react";
import api from "../api";
import { useAuth } from "../components/AuthContext";
import ProductDetailsModal from "../components/ProductDetailsModal";

export default function Marketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleBuyNow = async (productId) => {
    setBuying(productId);
    try {
      const res = await api.post(`/escrows/product/${productId}`);
      navigate(`/escrow/${res.data.id}`);
    } catch (err) {
      alert("Failed to initiate purchase: " + (err.response?.data?.message || err.message));
      setBuying(null);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading marketplace...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 flex items-center">
          <ShoppingBag className="mr-2 h-6 w-6 text-blue-600" />
          TrustBridge Marketplace
        </h1>
        {user?.role === 'SELLER' && (
          <Link
            to="/products/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            List Product
          </Link>
        )}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200 shadow-sm">
          <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No products available</h3>
          <p className="mt-1 text-sm text-slate-500">
            Check back later for new listings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group relative bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
              <div className="aspect-w-3 aspect-h-2 bg-slate-100 sm:aspect-none sm:h-48 border-b border-slate-200 flex items-center justify-center">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-center object-cover"
                  />
                ) : (
                  <ShoppingBag className="h-12 w-12 text-slate-300" />
                )}
              </div>
              <div className="flex-1 p-4 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-slate-900">
                      {product.title}
                    </h3>
                    {product.purchaseCount > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {product.purchaseCount} Purchased
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{product.description}</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 mb-4">₹{parseFloat(product.price).toFixed(2)}</p>
                  
                  {user?.id === product.seller.id ? (
                    <div className="text-center py-2 bg-slate-100 text-slate-500 rounded-md text-sm font-medium border border-slate-200">
                      Your Listing
                    </div>
                  ) : user?.role === 'BUYER' ? (
                    <button
                      onClick={() => handleBuyNow(product.id)}
                      disabled={buying === product.id}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {buying === product.id ? 'Processing...' : 'Buy with Escrow'}
                    </button>
                  ) : null}
                  <p className="text-xs text-center mt-2 text-slate-400">
                    Seller is {product.seller.isVerified ? 'Verified ✓' : 'Unverified'}
                  </p>
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="w-full mt-3 inline-flex justify-center items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
                  >
                    View Details & History
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
