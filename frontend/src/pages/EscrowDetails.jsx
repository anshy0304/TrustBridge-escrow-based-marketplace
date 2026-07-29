import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { CheckCircle2, CircleDashed, ArrowRight } from "lucide-react";

export default function EscrowDetails() {
  const { id } = useParams();
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEscrow = async () => {
    try {
      const response = await api.get(`/escrows/${id}`);
      setEscrow(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscrow();
  }, [id]);

  const handleAction = async (action) => {
    setActionLoading(true);
    try {
      await api.post(`/escrows/${id}/${action}`);
      await fetchEscrow(); // refresh data
    } catch (error) {
      alert("Action failed: " + (error.response?.data?.message || "Unknown error"));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!escrow) return <div className="text-center py-10 text-red-500">Transaction not found</div>;

  const StatusBadge = ({ status }) => {
    const colors = {
      PENDING_FUNDING: "bg-yellow-100 text-yellow-800",
      FUNDED_IN_ESCROW: "bg-blue-100 text-blue-800",
      FULFILLED: "bg-indigo-100 text-indigo-800",
      RELEASED: "bg-green-100 text-green-800",
      IN_DISPUTE: "bg-red-100 text-red-800",
      REFUNDED: "bg-slate-100 text-slate-800",
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.PENDING_FUNDING}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow sm:rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-slate-900">
              {escrow.title}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Transaction ID: #{escrow.id}
            </p>
          </div>
          <StatusBadge status={escrow.status} />
        </div>
        <div className="border-t border-slate-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-slate-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-slate-500">Amount</dt>
              <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2 font-mono font-medium">
                ${parseFloat(escrow.amount).toFixed(2)}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-slate-500">Platform Fee</dt>
              <dd className="mt-1 text-sm text-slate-500 sm:mt-0 sm:col-span-2 font-mono">
                ${parseFloat(escrow.platformFee).toFixed(2)}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-slate-500">Description</dt>
              <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">
                {escrow.description}
              </dd>
            </div>
          </dl>
        </div>
        
        {/* Actions Bar */}
        <div className="bg-slate-50 px-4 py-4 sm:px-6 border-t border-slate-200 flex flex-wrap gap-3 justify-end">
          {escrow.status === 'PENDING_FUNDING' && (
            <button
              onClick={() => handleAction('fund')}
              disabled={actionLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Simulate Buyer Payment
            </button>
          )}
          {escrow.status === 'FUNDED_IN_ESCROW' && (
            <button
              onClick={() => handleAction('fulfill')}
              disabled={actionLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Simulate Seller Fulfillment
            </button>
          )}
          {escrow.status === 'FULFILLED' && (
            <button
              onClick={() => handleAction('release')}
              disabled={actionLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              Buyer Approve & Release Funds
            </button>
          )}
          {escrow.status === 'RELEASED' && (
            <div className="flex items-center text-green-700 text-sm font-medium">
              <CheckCircle2 className="mr-1 h-5 w-5" /> Funds Released to Seller
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
