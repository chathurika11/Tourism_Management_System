import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AtSign, Send, Lock, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailSent, setEmailSent] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Please enter your username');
      return;
    }
    setLoading(true);
    const result = await forgotPassword(username);
    if (result && result.success) {
      setEmailSent(result.email);
      setStep(2);
      if (result.devMode) {
        toast.success(`OTP generated! Check the backend/server console for: ${result.email}`);
      } else {
        toast.success(`OTP sent to ${result.email}`);
      }
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    const success = await resetPassword(username, otp, newPassword);
    if (success) {
      toast.success('Password reset successful! Please login.');
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-cream">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary">Reset Password</h2>
          <p className="text-gray-600 mt-2">
            {step === 1 
              ? 'Enter your username to receive an OTP' 
              : 'Enter the OTP and your new password'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP}>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Username</label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="input-field pl-10" 
                  placeholder="Enter your username"
                  required 
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              <Send size={20} /> {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">OTP Code</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  className="input-field pl-10" 
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  required 
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {emailSent ? `OTP sent to: ${emailSent}` : 'Check your email for OTP'}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className="input-field pl-10" 
                  placeholder="Enter new password"
                  required 
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="input-field pl-10" 
                  placeholder="Confirm new password"
                  required 
                />
              </div>
              {newPassword !== confirmPassword && confirmPassword !== '' && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
              )}
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full py-3"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}
        
        <div className="text-center mt-6">
          <Link to="/login" className="text-accent hover:underline flex items-center justify-center gap-1">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;