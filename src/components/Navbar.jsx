import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center text-white">
        <div className="text-2xl font-semibold">
          <Link to="/">College Room Management</Link>
        </div>
        <div className="space-x-4 flex items-center">
          {/* Show these links only if user is logged in */}
          {user && (
            <>
              <Link to="/" className="hover:underline">
                Home
              </Link>
              <Link to="/dashboard" className="hover:underline">
                Dashboard
              </Link>
              <Link to="/buildings" className="hover:underline">
                Buildings
              </Link>
            </>
          )}

          {/* Auth buttons */}
          {user ? (
            <>
              <span>Welcome, {user.name}</span>
              <button
                onClick={onLogout}
                className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-md hover:bg-blue-500"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-md hover:bg-blue-500"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
