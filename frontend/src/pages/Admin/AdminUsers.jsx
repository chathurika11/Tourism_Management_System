import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, Shield, UserCheck, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../services/api';

const ADMIN_SECRET_PIN = '1234';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [adminPin, setAdminPin] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load users';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.includes(searchTerm));
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleEditClick = (user) => {
    setEditData({ ...user });
    setAdminPin('');
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (editData.role === 'admin') {
      if (!adminPin || adminPin !== ADMIN_SECRET_PIN) {
        toast.error('Invalid Admin PIN');
        return;
      }
    }
    try {
      const { id, name, username, email, phone, address, country } = editData;
      await API.put(`/auth/users/${id}`, { name, username, email, phone, address, country });
      toast.success('User updated successfully');
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const handleDeleteClick = (user) => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser?.id === user.id) {
      toast.error('You cannot delete your own account');
      return;
    }
    setUserToDelete(user);
    setAdminPin('');
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (userToDelete.role === 'admin') {
      if (!adminPin || adminPin !== ADMIN_SECRET_PIN) {
        toast.error('Invalid Admin PIN');
        return;
      }
    }
    try {
      await API.delete(`/auth/users/${userToDelete.id}`);
      toast.success('User deleted');
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return (
        <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
          <Shield size={12} className="mr-1" /> Admin
        </span>
      );
    }
    return (
      <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
        <UserCheck size={12} className="mr-1" /> Customer
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button onClick={fetchUsers} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Registered Users</h1>
          <p className="text-sm text-gray-500 mt-1">Total Users: {users.length}</p>
        </div>
        <button onClick={fetchUsers} className="text-primary hover:text-secondary transition" title="Refresh">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, username, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="input-field w-40"
        >
          <option value="all">All Roles</option>
          <option value="user">Customers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No users found matching your criteria
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users size={20} className="text-primary" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email || '—'}</div>
                    <div className="text-sm text-gray-500">{user.phone || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.address ? `${user.address}, ${user.country || ''}` : (user.country || '—')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewUserDetails(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit User"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-primary">User Details</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <div className="p-6 space-y-3">
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Username:</strong> @{selectedUser.username}</p>
              <p><strong>Email:</strong> {selectedUser.email || '—'}</p>
              <p><strong>Phone:</strong> {selectedUser.phone || '—'}</p>
              <p><strong>Address:</strong> {selectedUser.address || '—'}</p>
              <p><strong>Country:</strong> {selectedUser.country || '—'}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>Registered:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
            </div>
            <div className="border-t p-4">
              <button onClick={() => setShowModal(false)} className="btn-primary w-full">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-primary">
                {editData.role === 'admin' ? 'Edit Admin' : 'Edit User'}
              </h2>
              <button onClick={() => setShowEditModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateUser(); }} className="p-4 space-y-3">
              <input type="text" placeholder="Full Name *" value={editData.name || ''} onChange={(e) => setEditData({...editData, name: e.target.value})} className="input-field" required />
              <input type="text" placeholder="Username *" value={editData.username || ''} onChange={(e) => setEditData({...editData, username: e.target.value})} className="input-field" required />
              <input type="email" placeholder="Email" value={editData.email || ''} onChange={(e) => setEditData({...editData, email: e.target.value})} className="input-field" />
              <input type="tel" placeholder="Phone" value={editData.phone || ''} onChange={(e) => setEditData({...editData, phone: e.target.value})} className="input-field" />
              <input type="text" placeholder="Address" value={editData.address || ''} onChange={(e) => setEditData({...editData, address: e.target.value})} className="input-field" />
              <input type="text" placeholder="Country" value={editData.country || ''} onChange={(e) => setEditData({...editData, country: e.target.value})} className="input-field" />
              {editData.role === 'admin' && (
                <input type="password" placeholder="Admin PIN *" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} className="input-field" required />
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-red-600">Delete {userToDelete.role === 'admin' ? 'Admin' : 'User'}</h2>
              <button onClick={() => setShowDeleteConfirm(false)}><X size={24} /></button>
            </div>
            <div className="p-4">
              <p className="mb-4">Are you sure you want to delete <strong>{userToDelete.name}</strong>?</p>
              {userToDelete.role === 'admin' && (
                <input type="password" placeholder="Admin PIN *" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} className="input-field mb-4" required />
              )}
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="btn-outline flex-1">Cancel</button>
                <button onClick={confirmDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg flex-1 hover:bg-red-700 transition">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;