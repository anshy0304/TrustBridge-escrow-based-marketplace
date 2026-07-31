import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import { ShieldCheck, UserCheck, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [escrows, setEscrows] = useState([]);
  const [activeTab, setActiveTab] = useState("escrows"); // "escrows" or "users"
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get("/admin/users");
      const escrowsRes = await api.get("/admin/escrows");
      setUsers(usersRes.data);
      setEscrows(escrowsRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifySeller = async (id) => {
    try {
      await api.post(`/admin/users/${id}/verify`);
      fetchAdminData();
    } catch (err) {
      alert("Verification failed");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Admin Data...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center space-x-3">
        <ShieldCheck className="h-8 w-8 text-indigo-600" />
        <h1 className="text-2xl font-bold text-slate-900">Admin Command Center</h1>
      </div>

      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-8 px-2 sm:px-0">
          <button
            onClick={() => setActiveTab("escrows")}
            className={`${
              activeTab === "escrows"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Platform Transactions
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`${
              activeTab === "users"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Users & Verification
          </button>
        </nav>
      </div>

      {activeTab === "escrows" && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-slate-200">
          <ul className="divide-y divide-slate-200">
            {escrows.map((escrow) => (
              <li key={escrow.id}>
                <Link to={`/escrow/${escrow.id}`} className="block hover:bg-slate-50">
                  <div className="px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="mb-2 sm:mb-0">
                      <p className="text-sm font-medium text-indigo-600 truncate">{escrow.title}</p>
                      <p className="mt-1 text-sm text-slate-500">ID: #{escrow.id} • ${escrow.amount}</p>
                    </div>
                    <div>
                      {escrow.status === "IN_DISPUTE" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="mr-1 h-3 w-3" /> DISPUTED
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {escrow.status}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
            {escrows.length === 0 && <li className="p-6 text-center text-slate-500">No transactions found.</li>}
          </ul>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-slate-200">
          <ul className="divide-y divide-slate-200">
            {users.map((user) => (
              <li key={user.id} className="px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedUser(user)}>
                <div>
                  <p className="text-sm font-medium text-slate-900">{user.email}</p>
                  <p className="text-xs text-slate-500">ID: {user.id} • Role: {user.role}</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:mt-0 mt-2">
                  {user.role === "SELLER" && !user.verified ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleVerifySeller(user.id); }}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700"
                    >
                      <UserCheck className="mr-1 h-4 w-4" /> Verify Seller
                    </button>
                  ) : user.verified ? (
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                       Verified
                     </span>
                  ) : null}
                  <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800">
                    View Profile
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-4 py-5 sm:px-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg leading-6 font-medium text-slate-900">User Profile: {selectedUser.email}</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-500 font-bold text-xl">&times;</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="block text-xs text-slate-500">User ID</span>
                  <strong className="text-sm">{selectedUser.id}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="block text-xs text-slate-500">Role</span>
                  <strong className="text-sm">{selectedUser.role}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="block text-xs text-slate-500">Verification Status</span>
                  <strong className={`text-sm ${selectedUser.verified ? 'text-green-600' : 'text-slate-600'}`}>
                    {selectedUser.verified ? 'Verified' : 'Unverified'}
                  </strong>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="block text-xs text-slate-500">Stripe Account</span>
                  <strong className="text-sm font-mono text-xs break-all">{selectedUser.stripeAccountId || 'None'}</strong>
                </div>
              </div>

              <h4 className="text-md font-bold mb-3 border-b pb-2">Transaction History</h4>
              <ul className="divide-y divide-slate-100 max-h-64 overflow-y-auto border border-slate-200 rounded">
                {escrows.filter(e => e.buyerId === selectedUser.id || e.sellerId === selectedUser.id).map(e => (
                  <li key={e.id} className="p-3 hover:bg-slate-50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-indigo-600">{e.title} (ID: #{e.id})</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100">{e.status}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Amount: ₹{e.amount}</span>
                      <span>Role: {e.buyerId === selectedUser.id ? 'BUYER' : 'SELLER'}</span>
                    </div>
                    {e.disputeReason && e.status === 'IN_DISPUTE' && (
                      <div className="mt-2 text-xs p-2 bg-red-50 text-red-700 border border-red-100 rounded">
                        <strong>Dispute:</strong> {e.disputeReason}
                      </div>
                    )}
                    <div className="mt-2 text-right">
                       <Link to={`/escrow/${e.id}`} className="text-xs text-blue-600 hover:underline">View Details &rarr;</Link>
                    </div>
                  </li>
                ))}
                {escrows.filter(e => e.buyerId === selectedUser.id || e.sellerId === selectedUser.id).length === 0 && (
                  <li className="p-4 text-center text-sm text-slate-500">No transactions found for this user.</li>
                )}
              </ul>
            </div>
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-right">
              <button onClick={() => setSelectedUser(null)} className="px-4 py-2 bg-white border border-slate-300 rounded shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
