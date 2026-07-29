import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import { ShieldCheck, UserCheck, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [escrows, setEscrows] = useState([]);
  const [activeTab, setActiveTab] = useState("escrows"); // "escrows" or "users"
  const [loading, setLoading] = useState(true);

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

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
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
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div>
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
              <li key={user.id} className="px-4 py-4 sm:px-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{user.email}</p>
                  <p className="text-xs text-slate-500">ID: {user.id} • Role: {user.role}</p>
                </div>
                <div>
                  {user.role === "SELLER" && !user.verified ? (
                    <button
                      onClick={() => handleVerifySeller(user.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700"
                    >
                      <UserCheck className="mr-1 h-4 w-4" /> Verify Seller
                    </button>
                  ) : user.verified ? (
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                       Verified
                     </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
