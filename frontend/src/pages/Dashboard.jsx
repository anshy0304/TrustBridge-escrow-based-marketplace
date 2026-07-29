import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus } from "lucide-react";

export default function Dashboard() {
  // In a real app, we'd fetch this from the backend. 
  // For the skeleton, we simulate empty state or fetched state.
  const [escrows, setEscrows] = useState([]);

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
            {/* List items will go here when we wire up the API */}
          </ul>
        )}
      </div>
    </div>
  );
}
