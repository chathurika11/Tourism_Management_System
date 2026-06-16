import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const getDashboardPath = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'staff') return '/admin/dashboard';
  return '/customer/dashboard';
};

const ChangePassword = () => {
  const { user, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      toast.error('New password must contain at least one letter and one number');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    const updatedUser = await changePassword(currentPassword, newPassword);
    setLoading(false);
    if (updatedUser) {
      navigate(getDashboardPath(updatedUser.role), { replace: true });
    }
  };

  return (
    <div className="min-h-[70vh] bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-xl shadow max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-primary/10 rounded-full p-3">
            <KeyRound className="text-primary" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">Set New Password</h1>
            <p className="text-sm text-gray-500">Welcome {user?.name || 'there'}. Please change your temporary password.</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field pl-10"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field pl-10"
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Min 6 characters, at least 1 letter and 1 number</p>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pl-10"
                required
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Saving...' : 'Save Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
