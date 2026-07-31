import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus, Wallet, TrendingUp, AlertCircle } from "lucide-react";
import api from "../api";
import { useAuth } from "../components/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyEscrows = async () => {
      try {
        const res = await api.get("/escrows");
        // Filter for my escrows
        const myEscrows = res.data.filter(e => e.buyerId === user?.id || e.sellerId === user?.id);
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

  const isSeller = user?.role === 'SELLER';
  const sellerEscrows = escrows.filter(e => e.sellerId === user?.id);
  
  const totalRevenue = sellerEscrows
    .filter(e => e.status === 'RELEASED')
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) - parseFloat(curr.platformFee)), 0);
    
  const pendingFunds = sellerEscrows
    .filter(e => ['FUNDED_IN_ESCROW', 'FULFILLED', 'IN_DISPUTE'].includes(e.status))
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) - parseFloat(curr.platformFee)), 0);
    
  const successfulSales = sellerEscrows.filter(e => e.status === 'RELEASED').length;

  return (
    <div className="space-y-6">
      {isSeller && (
        <div className="mb-8">
          <h2 className="text-lg leading-6 font-medium text-slate-900 mb-4">Wallet & Analytics</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow sm:rounded-lg border border-slate-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Wallet className="h-6 w-6 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-slate-500 truncate">Available Revenue</dt>
                      <dd>
                        <div className="text-2xl font-semibold text-slate-900">₹{totalRevenue.toFixed(2)}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow sm:rounded-lg border border-slate-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-yellow-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-slate-500 truncate">Pending in Escrow</dt>
                      <dd>
                        <div className="text-2xl font-semibold text-slate-900">₹{pendingFunds.toFixed(2)}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow sm:rounded-lg border border-slate-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-slate-500 truncate">Completed Sales</dt>
                      <dd>
                        <div className="text-2xl font-semibold text-slate-900">{successfulSales}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-200 pt-6">
        <h1 className="text-2xl font-semibold text-slate-900">Your Escrows</h1>
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
                        ₹{parseFloat(escrow.amount).toFixed(2)} • Role: {escrow.buyerId === user?.id ? 'Buyer' : 'Seller'}
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
