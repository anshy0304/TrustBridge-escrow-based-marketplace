import { useState } from "react";
import api from "../api";
import { UploadCloud } from "lucide-react";

export default function EditProductModal({ product, onClose, onSuccess }) {
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price);
  const [inStock, setInStock] = useState(product.inStock !== false); // default true if undefined
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product.imageUrl || "");
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError("Image must be smaller than 2MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.put(`/products/${product.id}`, {
        title,
        description,
        price: parseFloat(price),
        imageUrl: imagePreview,
        inStock
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
    <div className="fixed inset-0 bg-slate-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full my-8">
        <div className="px-4 py-5 sm:px-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg leading-6 font-medium text-slate-900">
            Edit Listing
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
            
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-md">
              <div>
                <label className="block text-sm font-medium text-slate-900">
                  Product is in stock
                </label>
                <p className="text-xs text-slate-500">Uncheck this to mark as out of stock</p>
              </div>
              <div>
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
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
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Product Image</label>
              <div className="mt-1 flex justify-center px-6 pt-4 pb-4 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="mb-2">
                      <img src={imagePreview} alt="Preview" className="mx-auto h-24 object-contain" />
                    </div>
                  ) : (
                    <UploadCloud className="mx-auto h-8 w-8 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="edit-file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Change Image</span>
                      <input id="edit-file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
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
