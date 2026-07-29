import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus } from "lucide-react";
import api from "../api";
import { useAuth } from "../components/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyEscrows = async () => {
      try {
        const res = await api.get("/admin/escrows"); // Mocking this: in reality we'd have a /escrows/me endpoint
        // Filter for my escrows
        const myEscrows = res.data.filter(e => e.buyer.id === user.id || e.seller.id === user.id);
        setEscrows(myEscrows);
      } catch (err) {
        console.error("Failed to fetch escrows", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyEscrows();
  }, [user]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Your Escrows</h1>
        <Link
          to="/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Transaction
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-slate-200">
        {escrows.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No transactions</h3>
            <p className="mt-1 text-sm text-slate-500">
              Get started by creating a new escrow transaction.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {escrows.map((escrow) => (
              <li key={escrow.id}>
                <Link to={`/escrow/${escrow.id}`} className="block hover:bg-slate-50">
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 truncate">{escrow.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        ${escrow.amount} • Role: {escrow.buyer.id === user.id ? 'Buyer' : 'Seller'}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {escrow.status}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
