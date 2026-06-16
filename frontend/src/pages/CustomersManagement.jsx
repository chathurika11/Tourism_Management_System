import React, { useEffect, useState } from 'react';
import { Edit2, Trash2, UserPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  name: '',
  username: '',
  email: '',
  phone: '',
  address: '',
  country: 'Sri Lanka',
  password: '',
  status: 'ACTIVE',
};

const CustomersManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { isMainAdmin } = useAuth();

  const fetchCustomers = async () => {
    try {
      const res = await API.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load customers');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (customer) => {
    setEditing(customer);
    setForm({ ...emptyForm, ...customer, password: '' });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/customers/${editing.id}`, form);
        toast.success('Customer updated');
      } else {
        await API.post('/customers', form);
        toast.success('Customer created');
      }
      setShowForm(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    }
  };

  const remove = async (customer) => {
    if (!window.confirm(`Delete ${customer.name}?`)) return;
    try {
      await API.delete(`/customers/${customer.id}`);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="min-h-[70vh] bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary">Customer Management</h1>
          {isMainAdmin && (
            <button onClick={openCreate} className="btn-primary flex items-center gap-2"><UserPlus size={18} /> Add Customer</button>
          )}
        </div>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                {isMainAdmin && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-4 py-3 text-sm">{customer.name}</td>
                  <td className="px-4 py-3 text-sm">@{customer.username}</td>
                  <td className="px-4 py-3 text-sm">{customer.email || '-'}</td>
                  <td className="px-4 py-3 text-sm">{customer.status}</td>
                  {isMainAdmin && (
                    <td className="px-4 py-3 text-sm">
                      <button onClick={() => openEdit(customer)} className="text-yellow-600 mr-3"><Edit2 size={16} /></button>
                      <button onClick={() => remove(customer)} className="text-red-600"><Trash2 size={16} /></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={submit} className="bg-white rounded-xl max-w-2xl w-full p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2 flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold text-primary">{editing ? 'Edit Customer' : 'Add Customer'}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X size={22} /></button>
            </div>
            <input className="input-field" placeholder="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="input-field" placeholder="Username *" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required disabled={!!editing} />
            <input className="input-field" placeholder="Email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="input-field" placeholder="Phone" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input-field" placeholder="Address" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <input className="input-field" placeholder="Country" value={form.country || ''} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            {!editing && <input className="input-field" type="password" placeholder="Password *" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />}
            <select className="input-field" value={form.status || 'ACTIVE'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <button className="btn-primary md:col-span-2" type="submit">{editing ? 'Update Customer' : 'Create Customer'}</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CustomersManagement;
