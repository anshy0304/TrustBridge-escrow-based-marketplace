import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ escrowId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    // In a real flow, you'd fetch the clientSecret from backend here.
    // For this MVP, we simulate success and call our backend to hold funds.
    setTimeout(async () => {
      try {
        await api.post(`/escrows/${escrowId}/fund`);
        onSuccess();
      } catch (err) {
        alert("Funding failed");
      }
      setLoading(false);
    }, 1500); // simulate network delay
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 bg-white p-4 rounded-md border border-slate-200">
      <h4 className="text-sm font-medium mb-3 text-slate-700">Pay with Stripe</h4>
      <div className="p-3 border border-slate-300 rounded bg-slate-50 mb-4">
        <CardElement options={{style: {base: {fontSize: '16px', color: '#424770', '::placeholder': {color: '#aab7c4'}}}}} />
      </div>
      <button type="submit" disabled={!stripe || loading} className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
        {loading ? 'Processing...' : 'Pay & Secure Funds'}
      </button>
      <p className="text-xs text-center mt-2 text-slate-500">Use test card 4242 4242 4242 4242</p>
    </form>
  );
};

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
      if (action.startsWith('admin-resolve')) {
        const queryParams = action.split('?')[1];
        await api.post(`/admin/escrows/${id}/resolve?${queryParams}`);
      } else {
        await api.post(`/escrows/${id}/${action}`);
      }
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
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-slate-50 border-b border-slate-200">
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
        
        {/* Admin Dispute Resolution Panel */}
        {escrow.status === 'IN_DISPUTE' && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-5 sm:p-6">
            <h4 className="text-md font-bold text-red-800 flex items-center">
              <CircleDashed className="mr-2 h-5 w-5" /> Admin Dispute Resolution
            </h4>
            <p className="mt-1 text-sm text-red-700 mb-4">
              This transaction has been flagged for a dispute. As an Admin, you can review evidence and force a resolution.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleAction('admin-resolve?refundBuyer=true')}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                Force Refund to Buyer
              </button>
              <button
                onClick={() => handleAction('admin-resolve?refundBuyer=false')}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
              >
                Force Payout to Seller
              </button>
            </div>
          </div>
        )}

        <div className="px-4 py-5 sm:p-0">
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
        <div className="bg-slate-50 px-4 py-4 sm:px-6 border-t border-slate-200 flex flex-col gap-3 justify-end">
          {escrow.status === 'PENDING_FUNDING' && (
            <Elements stripe={stripePromise}>
              <CheckoutForm escrowId={escrow.id} onSuccess={fetchEscrow} />
            </Elements>
          )}
          {escrow.status === 'FUNDED_IN_ESCROW' && (
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => handleAction('dispute')}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 border border-red-200 text-sm font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                Raise Dispute
              </button>
              <button
                onClick={() => handleAction('fulfill')}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Simulate Seller Fulfillment
              </button>
            </div>
          )}
          {escrow.status === 'FULFILLED' && (
            <div className="flex gap-3">
              <button
                onClick={() => handleAction('dispute')}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 border border-red-200 text-sm font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                Raise Dispute
              </button>
              <button
                onClick={() => handleAction('release')}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                Buyer Approve & Release Funds
              </button>
            </div>
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
