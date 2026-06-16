import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, Phone, Home, Globe, AtSign, UserCircle, IdCard } from 'lucide-react';
import toast from 'react-hot-toast';
import registerImage from '../images/register.jpeg';

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idType, setIdType] = useState('nic');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [idError, setIdError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const countryCodes = {
    'Sri Lanka': '+94',
    'India': '+91',
    'USA': '+1',
    'UK': '+44',
    'Australia': '+61',
    'Canada': '+1',
    'Germany': '+49',
    'France': '+33',
    'Japan': '+81',
    'China': '+86',
    'Malaysia': '+60',
    'Singapore': '+65',
    'Thailand': '+66',
    'Vietnam': '+84',
    'Indonesia': '+62',
    'Pakistan': '+92',
    'Bangladesh': '+880',
    'Nepal': '+977',
    'Maldives': '+960',
    'UAE': '+971',
  };

  const validateSriLankanNIC = (nic) => {
    nic = nic.toUpperCase().trim();
    const oldFormat = /^[1-9][0-9]{8}[Vv]$/;
    const newFormat = /^[1-9][0-9]{11}$/;
    if (oldFormat.test(nic)) return { valid: true, type: 'old', message: 'Valid NIC (Old format)' };
    if (newFormat.test(nic)) return { valid: true, type: 'new', message: 'Valid NIC (New format)' };
    return { valid: false, message: 'Invalid NIC: 9 digits + V or 12 digits, cannot start with 0' };
  };

  const validatePassport = (passport) => {
    passport = passport.trim().toUpperCase();
    const passportRegex = /^[A-Z0-9]{6,12}$/;
    if (passportRegex.test(passport)) return { valid: true, message: 'Valid Passport Number' };
    return { valid: false, message: 'Invalid Passport: 6-12 characters, letters and numbers only' };
  };

  const validateIdNumber = (id, type) => {
    if (!id) {
      setIdError('ID Number is required');
      return false;
    }
    if (type === 'nic') {
      const result = validateSriLankanNIC(id);
      setIdError(result.valid ? '' : result.message);
      return result.valid;
    } else {
      const result = validatePassport(id);
      setIdError(result.valid ? '' : result.message);
      return result.valid;
    }
  };

  const validatePassword = (pwd) => {
    if (pwd.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasDigit = /[0-9]/.test(pwd);
    if (!hasLetter || !hasDigit) {
      setPasswordError('Password must contain at least one letter and one number');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateEmail = (emailValue) => {
    if (!emailValue) {
      setEmailError('');
      return true;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailValue)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    const code = countryCodes[country] || '';
    setCountryCode(code);
    const currentPhone = phone.replace(/^\+?\d*/, '');
    setPhone(code + currentPhone);
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    if (countryCode && !value.startsWith(countryCode)) {
      value = countryCode + value.replace(/^\+?\d*/, '');
    }
    setPhone(value);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    validateEmail(newEmail);
  };

  const handleIdChange = (e) => {
    const value = e.target.value;
    setIdNumber(value);
    if (value) validateIdNumber(value, idType);
    else setIdError('');
  };

  const handleIdTypeChange = (type) => {
    setIdType(type);
    if (idNumber) validateIdNumber(idNumber, type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword(password)) {
      toast.error(passwordError);
      return;
    }
    if (email && !validateEmail(email)) {
      toast.error(emailError);
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }
    if (!selectedCountry) {
      toast.error('Please select a country');
      return;
    }
    if (!idNumber) {
      toast.error('Please enter your NIC or Passport Number');
      return;
    }
    const isValid = validateIdNumber(idNumber, idType);
    if (!isValid) {
      toast.error(idError);
      return;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 9) {
      toast.error('Please enter a valid phone number (minimum 9 digits)');
      return;
    }
    setLoading(true);
    const userData = {
      name: name.trim(),
      username: username.trim(),
      email: email.trim() || null,
      phone: phone.trim(),
      address: address.trim(),
      country: selectedCountry,
      password: password,
      idNumber: idNumber.trim().toUpperCase(),
      idType: idType
    };
    const success = await register(userData);
    setLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${registerImage})`, filter: 'blur(4px)' }} />
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 bg-white rounded-2xl shadow-xl max-w-2xl mx-auto p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary">Join SerendiGo</h2>
          <p className="text-gray-600 mt-2">Create an account to plan your perfect Sri Lankan journey</p>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field pl-10" required />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Username *</label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-field pl-10" required />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Email (optional)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input type="email" value={email} onChange={handleEmailChange} className="input-field pl-10" placeholder="user@example.com" />
            </div>
            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Country *</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select value={selectedCountry} onChange={handleCountryChange} className="input-field pl-10" required>
                <option value="">Select Country</option>
                {Object.keys(countryCodes).map(country => <option key={country}>{country}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Phone Number *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input type="tel" value={phone} onChange={handlePhoneChange} className="input-field pl-10" placeholder={countryCode ? `${countryCode} XX XXX XXXX` : "Select country first"} required disabled={!selectedCountry} />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Address *</label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="input-field pl-10" required />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">ID / Passport Number *</label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" value={idNumber} onChange={handleIdChange} className="input-field pl-10" placeholder="Enter NIC or Passport" required />
            </div>
            {idError && <p className="text-red-500 text-xs mt-1">{idError}</p>}
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => handleIdTypeChange('nic')} className={`text-xs px-2 py-1 rounded ${idType === 'nic' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>NIC</button>
              <button type="button" onClick={() => handleIdTypeChange('passport')} className={`text-xs px-2 py-1 rounded ${idType === 'passport' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>Passport</button>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input type="password" value={password} onChange={handlePasswordChange} className="input-field pl-10" required />
            </div>
            {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
            <p className="text-xs text-gray-400 mt-1">Min 6 characters, at least 1 letter and 1 number</p>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Confirm Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field pl-10" required />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 p-3 border border-primary bg-primary/5 rounded-lg">
              <UserCircle size={20} className="text-primary" />
              <div><span className="font-semibold">Customer Account</span><p className="text-xs text-gray-500">Book tours, hotels, vehicles</p></div>
            </div>
          </div>
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
