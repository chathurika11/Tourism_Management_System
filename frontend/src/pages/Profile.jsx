import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import API from '../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    API.get('/auth/profile')
      .then((res) => setProfile(res.data))
      .catch((err) => toast.error(err.response?.data?.error || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put('/auth/profile', profile);
      setProfile(res.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await API.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password change failed');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!profile) return null;

  return (
    <div className="min-h-[70vh] bg-gray-100 p-6">
      <form onSubmit={updateProfile} className="bg-white rounded-xl shadow max-w-2xl mx-auto p-6 space-y-4 mb-6">
        <h1 className="text-2xl font-bold text-primary">My Profile</h1>
        <input className="input-field" value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Name" />
        <input className="input-field" value={profile.email || ''} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="Email" />
        <input className="input-field" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="Phone" />
        <input className="input-field" value={profile.address || ''} onChange={(e) => setProfile({ ...profile, address: e.target.value })} placeholder="Address" />
        <input className="input-field" value={profile.country || ''} onChange={(e) => setProfile({ ...profile, country: e.target.value })} placeholder="Country" />
        <button className="btn-primary w-full" type="submit">Update Profile</button>
      </form>
      <form onSubmit={changePassword} className="bg-white rounded-xl shadow max-w-2xl mx-auto p-6 space-y-4">
        <h2 className="text-xl font-bold text-primary">Change Password</h2>
        <input
          className="input-field"
          type="password"
          value={passwordData.currentPassword}
          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
          placeholder="Current Password"
          required
        />
        <input
          className="input-field"
          type="password"
          value={passwordData.newPassword}
          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
          placeholder="New Password"
          required
        />
        <input
          className="input-field"
          type="password"
          value={passwordData.confirmPassword}
          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
          placeholder="Confirm New Password"
          required
        />
        <button className="btn-primary w-full" type="submit">Change Password</button>
      </form>
    </div>
  );
};

export default Profile;
