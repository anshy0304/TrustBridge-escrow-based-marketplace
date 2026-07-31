import { useState } from "react";
import api from "../api";

export default function EditProductModal({ product, onClose, onSuccess }) {
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.put(`/products/${product.id}`, {
        description,
        price: parseFloat(price)
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Failed to update product. " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg leading-6 font-medium text-slate-900">
            Edit Listing: {product.title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-500 font-bold text-xl"
          >
            &times;
          </button>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-slate-700">
                Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                id="price"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
