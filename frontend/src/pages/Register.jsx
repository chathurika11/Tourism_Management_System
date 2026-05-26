import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import registerImage from '../images/register.jpeg';
// eslint-disable-next-line no-unused-vars
import { UserPlus, User, Mail, Lock, Phone, Home, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', age: '', email: '', phone: '', address: '', postalCode: '', country: '', username: '', password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    const success = await register({
      name: formData.name,
      age: formData.age,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      postalCode: formData.postalCode,
      country: formData.country,
      username: formData.username,
      password: formData.password,
    });
    setLoading(false);
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${registerImage})`, filter: 'blur(4px)' }}
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 bg-white rounded-2xl shadow-xl max-w-2xl mx-auto p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary">Join SerendiGo</h2>
          <p className="text-gray-600 mt-2">Create an account to plan your perfect Sri Lankan journey</p>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-gray-700 mb-1">Full Name *</label><div className="relative"><User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} /><input type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field pl-10" required /></div></div>
          <div><label className="block text-gray-700 mb-1">Age *</label><input type="number" name="age" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="input-field" required /></div>
          <div><label className="block text-gray-700 mb-1">Email *</label><div className="relative"><Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} /><input type="email" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input-field pl-10" required /></div></div>
          <div><label className="block text-gray-700 mb-1">Phone No *</label><div className="relative"><Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} /><input type="tel" name="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input-field pl-10" required /></div></div>
          <div><label className="block text-gray-700 mb-1">Address *</label><div className="relative"><Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} /><input type="text" name="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="input-field pl-10" required /></div></div>
          <div><label className="block text-gray-700 mb-1">Postal Code *</label><input type="text" name="postalCode" value={formData.postalCode} onChange={(e) => setFormData({...formData, postalCode: e.target.value})} className="input-field" required /></div>
          <div><label className="block text-gray-700 mb-1">Country *</label><div className="relative"><Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} /><input type="text" name="country" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="input-field pl-10" required /></div></div>
          <div><label className="block text-gray-700 mb-1">Username *</label><input type="text" name="username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="input-field" required /></div>
          <div><label className="block text-gray-700 mb-1">Password *</label><div className="relative"><Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} /><input type="password" name="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="input-field pl-10" required /></div></div>
          <div><label className="block text-gray-700 mb-1">Confirm Password *</label><div className="relative"><Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} /><input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} className="input-field pl-10" required /></div></div>
          <div className="md:col-span-2">
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              <UserPlus size={20} /> {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>
        </form>
        <p className="text-center mt-6 text-gray-600">Already have an account? <Link to="/login" className="text-secondary font-semibold hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
};

export default Register;