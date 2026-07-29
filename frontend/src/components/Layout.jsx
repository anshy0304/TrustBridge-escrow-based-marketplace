import { Outlet, Link } from "react-router-dom";
import { ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "./AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
                <span className="font-semibold text-xl tracking-tight text-slate-900">
                  TrustBridge
                </span>
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="border-blue-500 text-slate-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/create"
                  className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  New Escrow
                </Link>
                <Link
                  to="/admin"
                  className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Admin
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-slate-500">
                {user?.email} ({user?.role})
              </div>
              <button
                onClick={logout}
                className="text-slate-400 hover:text-slate-600"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
