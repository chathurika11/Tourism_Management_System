export const validateSriLankanNIC = (nic) => {
  if (!nic) return { valid: false, message: 'NIC is required' };
  const val = nic.toUpperCase().trim();
  const oldFormat = /^[1-9][0-9]{8}[VXvx]$/;
  const newFormat = /^[1-9][0-9]{11}$/;
  if (oldFormat.test(val)) return { valid: true, type: 'old', message: 'Valid NIC (Old format)' };
  if (newFormat.test(val)) return { valid: true, type: 'new', message: 'Valid NIC (New format)' };
  return { valid: false, message: 'Invalid Sri Lankan NIC: must be 9 digits + V/X or 12 digits, cannot start with 0' };
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

export const validatePassportNumber = (passport, country) => {
  if (!passport) return { valid: false, message: 'Passport number is required' };
  const val = passport.trim().toUpperCase();

  let regex = null;
  let errorMsg = '';

  switch (country) {
    case 'Sri Lanka':
      regex = /^[A-Z0-9]{6,12}$/;
      errorMsg = 'Invalid Sri Lankan Passport: must be 6-12 alphanumeric characters';
      break;
    case 'India':
      regex = /^(?:[A-Z]{1}[0-9]{7}|[A-Z]{2}[0-9]{6})$/;
      errorMsg = 'Invalid Indian Passport: 1 letter + 7 digits OR 2 letters + 6 digits';
      break;
    case 'USA':
      regex = /^[A-Z][0-9]{8}$/;
      errorMsg = 'Invalid US Passport: 1 letter + 8 digits';
      break;
    case 'UK':
      regex = /^[0-9]{9}$/;
      errorMsg = 'Invalid UK Passport: exactly 9 digits';
      break;
    case 'Australia':
      regex = /^(?:[NEDFACUXnedfacux]\d{7}|(?:PA|PB|PC|PD|PE|PF|PU|PW|PX|PZ|pa|pb|pc|pd|pe|pf|pu|pw|px|pz)\d{7})$/;
      errorMsg = 'Invalid Australian Passport: 1 letter (N,E,D,F,A,C,U,X) + 7 digits OR 2 letters (PA-PF, PU, PW, PX, PZ) + 7 digits';
      break;
    case 'Canada':
      regex = /^(?:[A-Z]{2}[0-9]{6}|[A-Z][0-9]{6}[A-Z]{2})$/;
      errorMsg = 'Invalid Canadian Passport: 2 letters + 6 digits OR 1 letter + 6 digits + 2 letters';
      break;
    case 'Germany':
      regex = /^[CFGHJKLMNPRTVWXYZcfghjklmnprtvwxyz][CFGHJKLMNPRTVWXYZcfghjklmnprtvwxyz0-9]{8,10}$/;
      errorMsg = 'Invalid German Passport: 9-11 characters, starts with a letter, using valid characters only (excludes A,B,E,I,O,Q,S,U)';
      break;
    case 'France':
      regex = /^[0-9]{2}[A-Za-z]{2}[0-9]{5}$/;
      errorMsg = 'Invalid French Passport: 2 digits + 2 letters + 5 digits';
      break;
    case 'Japan':
      regex = /^[A-Za-z]{2}\d{7}$/;
      errorMsg = 'Invalid Japanese Passport: 2 letters + 7 digits';
      break;
    case 'China':
      regex = /^(?:[A-Za-z]\d{8}|[A-Za-z]{2}\d{7})$/;
      errorMsg = 'Invalid Chinese Passport: 1 letter + 8 digits OR 2 letters + 7 digits';
      break;
    case 'Malaysia':
      regex = /^[AHK]\d{8}$/;
      errorMsg = 'Invalid Malaysian Passport: 1 letter (A, H, K) + 8 digits';
      break;
    case 'Singapore':
      regex = /^[EK]\d{7,8}[A-Z]$/;
      errorMsg = 'Invalid Singaporean Passport: E/K + 7-8 digits + 1 letter';
      break;
    case 'Thailand':
      regex = /^[A-Z]{1,2}\d{6,7}$/;
      errorMsg = 'Invalid Thai Passport: 1-2 letters + 6-7 digits';
      break;
    case 'Vietnam':
      regex = /^[A-Z]\d{7}$/;
      errorMsg = 'Invalid Vietnamese Passport: 1 letter + 7 digits';
      break;
    case 'Indonesia':
      regex = /^(?:[A-Z]\d{6,7}|[A-Z]\d{7}[A-Z])$/;
      errorMsg = 'Invalid Indonesian Passport: 1 letter + 6-7 digits OR 1 letter + 7 digits + 1 letter';
      break;
    case 'Pakistan':
      regex = /^[A-Z]{2}\d{7}$/;
      errorMsg = 'Invalid Pakistani Passport: 2 letters + 7 digits';
      break;
    case 'Bangladesh':
      regex = /^[A-Z0-9]{9}$/;
      errorMsg = 'Invalid Bangladeshi Passport: 9 alphanumeric characters';
      break;
    case 'Nepal':
      regex = /^\d{9}$/;
      errorMsg = 'Invalid Nepalese Passport: exactly 9 digits';
      break;
    case 'Maldives':
      regex = /^[A-Z]\d{7}$/;
      errorMsg = 'Invalid Maldivian Passport: 1 letter + 7 digits';
      break;
    case 'UAE':
      regex = /^[CFGHJKLMNPRTVWXYZcfghjklmnprtvwxyz0-9]{9}$/;
      errorMsg = 'Invalid UAE Passport: 9 alphanumeric characters (excluding A,B,E,I,O,Q,S,U)';
      break;
    default:
      regex = /^[A-Z0-9]{6,15}$/;
      errorMsg = 'Invalid Passport: 6-15 alphanumeric characters';
  }

  if (regex.test(val)) return { valid: true };
  return { valid: false, message: errorMsg };
};
