export const validateSriLankanNIC = (nic) => {
  if (!nic) return { valid: false, message: 'NIC is required' };
  const val = nic.toUpperCase().trim();
  const oldFormat = /^[1-9][0-9]{8}[VXvx]$/;
  const newFormat = /^[1-9][0-9]{11}$/;
  if (oldFormat.test(val)) return { valid: true, type: 'old', message: 'Valid NIC (Old format)' };
  if (newFormat.test(val)) return { valid: true, type: 'new', message: 'Valid NIC (New format)' };
  return { valid: false, message: 'Invalid Sri Lankan NIC: must be 9 digits + V/X or 12 digits, cannot start with 0' };
};

export const validateNICNumber = (nic, country) => {
  const val = nic.toUpperCase().trim();
  if (!val) return { valid: false, message: 'NIC is required' };
  if (country === 'Sri Lanka') {
    return validateSriLankanNIC(val);
  }
  const genericNic = /^[A-Z0-9]{6,15}$/;
  if (genericNic.test(val)) return { valid: true, message: 'Valid NIC' };
  return { valid: false, message: 'Invalid NIC: must be 6-15 alphanumeric characters' };
};

export const validatePhoneNumber = (phone, country, countryCode) => {
  if (!phone) return { valid: false, message: 'Phone number is required' };
  if (!phone.startsWith(countryCode)) {
    return { valid: false, message: `Phone number must start with country code ${countryCode}` };
  }
  const digitsAfterCode = phone.slice(countryCode.length).replace(/\D/g, '');
  const len = digitsAfterCode.length;

  switch (country) {
    case 'Sri Lanka':
      if (len !== 9) return { valid: false, message: 'Sri Lankan phone number must have exactly 9 digits after +94' };
      break;
    case 'India':
      if (len !== 10) return { valid: false, message: 'Indian phone number must have exactly 10 digits after +91' };
      break;
    case 'USA':
      if (len !== 10) return { valid: false, message: 'US phone number must have exactly 10 digits after +1' };
      break;
    case 'UK':
      if (len !== 10) return { valid: false, message: 'UK phone number must have exactly 10 digits after +44' };
      break;
    case 'Australia':
      if (len !== 9) return { valid: false, message: 'Australian mobile number must have exactly 9 digits after +61' };
      break;
    case 'Canada':
      if (len !== 10) return { valid: false, message: 'Canadian phone number must have exactly 10 digits after +1' };
      break;
    case 'Germany':
      if (len < 10 || len > 11) return { valid: false, message: 'German phone number must have 10-11 digits after +49' };
      break;
    case 'France':
      if (len !== 9) return { valid: false, message: 'French phone number must have exactly 9 digits after +33' };
      break;
    case 'Japan':
      if (len !== 10) return { valid: false, message: 'Japanese phone number must have exactly 10 digits after +81' };
      break;
    case 'China':
      if (len !== 11) return { valid: false, message: 'Chinese mobile number must have exactly 11 digits after +86' };
      break;
    case 'Malaysia':
      if (len < 9 || len > 10) return { valid: false, message: 'Malaysian phone number must have 9-10 digits after +60' };
      break;
    case 'Singapore':
      if (len !== 8) return { valid: false, message: 'Singaporean phone number must have exactly 8 digits after +65' };
      break;
    case 'Thailand':
      if (len !== 9) return { valid: false, message: 'Thai phone number must have exactly 9 digits after +66' };
      break;
    case 'Vietnam':
      if (len < 9 || len > 10) return { valid: false, message: 'Vietnamese phone number must have 9-10 digits after +84' };
      break;
    case 'Indonesia':
      if (len < 9 || len > 11) return { valid: false, message: 'Indonesian phone number must have 9-11 digits after +62' };
      break;
    case 'Pakistan':
      if (len !== 10) return { valid: false, message: 'Pakistani phone number must have exactly 10 digits after +92' };
      break;
    case 'Bangladesh':
      if (len !== 10) return { valid: false, message: 'Bangladeshi phone number must have exactly 10 digits after +880' };
      break;
    case 'Nepal':
      if (len !== 10) return { valid: false, message: 'Nepalese phone number must have exactly 10 digits after +977' };
      break;
    case 'Maldives':
      if (len !== 7) return { valid: false, message: 'Maldivian phone number must have exactly 7 digits after +960' };
      break;
    case 'UAE':
      if (len !== 9) return { valid: false, message: 'UAE phone number must have exactly 9 digits after +971' };
      break;
    default:
      if (len < 6 || len > 15) return { valid: false, message: 'Phone number must have between 6 and 15 digits after country code' };
  }
  return { valid: true };
};

export const validatePassportNumber = (passport) => {
  if (!passport) return { valid: false, message: 'Passport number is required' };
  const val = passport.trim().toUpperCase();
  const regex = /^[A-Z0-9]{6,15}$/;
  if (regex.test(val)) return { valid: true };
  return { valid: false, message: 'Invalid Passport: 6-15 alphanumeric characters' };
};
