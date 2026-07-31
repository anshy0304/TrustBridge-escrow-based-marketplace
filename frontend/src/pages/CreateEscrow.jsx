import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../components/AuthContext";

export default function CreateEscrow() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    buyerId: user?.id,
    sellerId: "", 
  });
  const [sellers, setSellers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch verified sellers for the dropdown
    const fetchSellers = async () => {
      try {
        const res = await api.get("/admin/users");
      } catch (err) {}
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await api.post("/escrows", formData);
      navigate(`/escrow/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow sm:rounded-lg border border-slate-200">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-slate-900">
            Initialize New Escrow
          </h3>
          <div className="mt-2 max-w-xl text-sm text-slate-500">
            <p>Funds will be held securely until terms are met.</p>
          </div>
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            )}
            
            <div>
              <label htmlFor="sellerId" className="block text-sm font-medium text-slate-700">
                Seller User ID
              </label>
              <input
                type="number"
                name="sellerId"
                id="sellerId"
                required
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                value={formData.sellerId}
                onChange={(e) => setFormData({ ...formData, sellerId: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                Transaction Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-700">
                Amount (₹)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  required
                  min="1"
                  step="0.01"
                  className="mt-1 block w-full pl-7 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                Terms / Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create & Fund Later"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
