import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const AccessDenied = () => (
  <div className="min-h-[70vh] flex items-center justify-center px-4">
    <div className="bg-white shadow rounded-xl p-8 max-w-md w-full text-center">
      <ShieldAlert size={48} className="mx-auto text-red-600 mb-4" />
      <h1 className="text-2xl font-bold text-primary mb-2">Access Denied</h1>
      <p className="text-gray-600 mb-6">You do not have permission to access this page.</p>
      <Link to="/login" className="btn-primary inline-block">Go to Login</Link>
    </div>
  </div>
);

export default AccessDenied;
