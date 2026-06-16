import React, { useEffect, useState } from 'react';
import { RefreshCw, Shield, UserCog } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../services/api';

const roleOptions = [
  { api: 'ADMIN', legacy: 'admin', label: 'Admin' },
  { api: 'STAFF', legacy: 'staff', label: 'Staff Member' },
  { api: 'CUSTOMER', legacy: 'user', label: 'Customer' },
];

const getRoleLabel = (role) => roleOptions.find((item) => item.legacy === role || item.api === role)?.label || role;
const getApiRole = (legacyRole) => roleOptions.find((item) => item.legacy === legacyRole)?.api || legacyRole;

const AdminRoles = () => {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, usersRes] = await Promise.all([
        API.get('/auth/roles'),
        API.get('/auth/users'),
      ]);
      setRoles(rolesRes.data);
      setUsers(usersRes.data);
      setSelectedRoles(
        usersRes.data.reduce((acc, user) => {
          acc[user.id] = getApiRole(user.role);
          return acc;
        }, {})
      );
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load role management');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const assignRole = async (user) => {
    try {
      await API.post(`/auth/users/${user.id}/roles`, { role: selectedRoles[user.id] });
      toast.success('Role assigned');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Role assignment failed');
    }
  };

  const removeRole = async (user) => {
    try {
      await API.delete(`/auth/users/${user.id}/roles/${getApiRole(user.role)}`);
      toast.success('Role removed');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Role removal failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Role Management</h1>
          <p className="text-sm text-gray-500 mt-1">Assign and remove roles for system users</p>
        </div>
        <button onClick={fetchData} className="btn-outline flex items-center gap-2">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
            <Shield size={22} className="text-primary" />
            <div>
              <p className="font-semibold">{getRoleLabel(role.name)}</p>
              <p className="text-xs text-gray-500">{role.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assign Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCog size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{getRoleLabel(user.role)}</td>
                <td className="px-6 py-4">
                  <select
                    value={selectedRoles[user.id] || getApiRole(user.role)}
                    onChange={(e) => setSelectedRoles({ ...selectedRoles, [user.id]: e.target.value })}
                    className="input-field max-w-xs"
                  >
                    {roleOptions.map((role) => (
                      <option key={role.api} value={role.api}>{role.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => assignRole(user)} className="btn-primary px-3 py-2 text-sm">Assign</button>
                    <button onClick={() => removeRole(user)} className="btn-outline px-3 py-2 text-sm">Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRoles;
