import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Building2, Car, Upload, UserRound, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/api';

const initialForm = {
  providerType: 'guide',
  requesterName: '',
  requesterEmail: '',
  requesterPhone: '+94',
  businessName: '',
  district: '',
  location: '',
  price: '',
  specialty: '',
  language: '',
  experience: '',
  certification: '',
  amenities: '',
  checkIn: '2:00 PM',
  checkOut: '12:00 PM',
  freeCancellationHours: '48',
  breakfastIncluded: false,
  type: '',
  passengers: '',
  fuelType: '',
  fuelEfficiency: '',
  year: '',
  pickupLocations: '',
  includedFeatures: '',
  securityDeposit: '',
  message: '',
};

const providerOptions = [
  { value: 'guide', label: 'Tour Guide', icon: UserRound },
  { value: 'hotel', label: 'Hotel', icon: Building2 },
  { value: 'vehicle', label: 'Vehicle', icon: Car },
];

const PartnerRegister = () => {
  const [formData, setFormData] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const submitMutation = useMutation({
    mutationFn: (fd) => API.post('/provider-requests', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      toast.success('Request sent to admin/staff for review.');
      setFormData(initialForm);
      setImages([]);
      setImagePreviews([]);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to submit request'),
  });

  const updateField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleImages = (e) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter((file) => file.size <= 2 * 1024 * 1024).slice(0, 5);
    if (valid.length !== selected.length) toast.error('Only 5 images allowed, max 2MB each.');
    setImages(valid);
    setImagePreviews(valid.map((file) => URL.createObjectURL(file)));
  };

  const validateEmail = (email) => email.toLowerCase().endsWith('@gmail.com');
  const validatePhone = (phone) => /^\+94[0-9]{9}$/.test(phone.replace(/\s/g, ''));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(formData.requesterEmail)) {
      toast.error('Email must be a Gmail address (@gmail.com)');
      return;
    }
    if (!validatePhone(formData.requesterPhone)) {
      toast.error('Phone must start with +94 and contain exactly 9 digits.');
      return;
    }
    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => fd.append(key, value));
    fd.append('pricePerDay', formData.price);
    fd.append('pricePerNight', formData.price);
    images.forEach((image) => fd.append('images', image));
    submitMutation.mutate(fd);
  };

  const renderSpecificFields = (formDataObj, setFormDataObj, providerType) => {
    const update = (field, value) => setFormDataObj((prev) => ({ ...prev, [field]: value }));

    if (providerType === 'guide') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
            <input className="input-field" value={formDataObj.specialty} onChange={(e) => update('specialty', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
            <input className="input-field" value={formDataObj.language} onChange={(e) => update('language', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
            <input className="input-field" placeholder="e.g., 5 years" value={formDataObj.experience} onChange={(e) => update('experience', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Certification</label>
            <input className="input-field" value={formDataObj.certification} onChange={(e) => update('certification', e.target.value)} />
          </div>
        </>
      );
    }

    if (providerType === 'hotel') {
      return (
        <>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Amenities (comma separated)</label>
            <textarea className="input-field" rows="3" value={formDataObj.amenities} onChange={(e) => update('amenities', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
            <input className="input-field" value={formDataObj.checkIn} onChange={(e) => update('checkIn', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
            <input className="input-field" value={formDataObj.checkOut} onChange={(e) => update('checkOut', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Free cancellation hours</label>
            <input className="input-field" type="number" value={formDataObj.freeCancellationHours} onChange={(e) => update('freeCancellationHours', e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={formDataObj.breakfastIncluded} onChange={(e) => update('breakfastIncluded', e.target.checked)} />
            <label className="text-sm text-gray-700">Breakfast included</label>
          </div>
        </>
      );
    }

    // Vehicle
    return (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle type</label>
          <input className="input-field" placeholder="Car, Van, SUV..." value={formDataObj.type} onChange={(e) => update('type', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
          <input className="input-field" type="number" value={formDataObj.passengers} onChange={(e) => update('passengers', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fuel type</label>
          <input className="input-field" value={formDataObj.fuelType} onChange={(e) => update('fuelType', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fuel efficiency</label>
          <input className="input-field" value={formDataObj.fuelEfficiency} onChange={(e) => update('fuelEfficiency', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <input className="input-field" value={formDataObj.year} onChange={(e) => update('year', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Security deposit</label>
          <input className="input-field" type="number" value={formDataObj.securityDeposit} onChange={(e) => update('securityDeposit', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Pickup locations (comma separated)</label>
          <textarea className="input-field" rows="3" value={formDataObj.pickupLocations} onChange={(e) => update('pickupLocations', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Included features (comma separated)</label>
          <textarea className="input-field" rows="3" value={formDataObj.includedFeatures} onChange={(e) => update('includedFeatures', e.target.value)} />
        </div>
      </>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-primary text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3">
            <Mail size={32} />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Contact Us – Register as a Provider</h1>
              <p className="text-white/80 max-w-2xl">
                Register your guide, hotel, or vehicle services. Your request will be reviewed by our team before publication.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold text-primary mb-4">Contact Information</h2>
          <div className="space-y-3">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">📞 Phone</h3>
              <p>+94 11 234 5678</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">📧 Email</h3>
              <p>hello@serendigo.com</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">📍 Address</h3>
              <p>Colombo, Sri Lanka</p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-5 max-w-4xl mx-auto">
          {/* Provider Type Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {providerOptions.map((option) => {
              const Icon = option.icon;
              const active = formData.providerType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField('providerType', option.value)}
                  className={`border rounded-lg p-4 flex items-center justify-center gap-2 transition ${
                    active ? 'border-primary bg-primary text-white' : 'border-gray-200 hover:border-primary text-gray-700'
                  }`}
                >
                  <Icon size={20} /> {option.label}
                </button>
              );
            })}
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                className="input-field"
                value={formData.requesterName}
                onChange={(e) => updateField('requesterName', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (must be @gmail.com) *</label>
              <input
                className="input-field"
                type="email"
                value={formData.requesterEmail}
                onChange={(e) => updateField('requesterEmail', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (+94xxxxxxxxx) *</label>
              <input
                className="input-field"
                value={formData.requesterPhone}
                onChange={(e) => updateField('requesterPhone', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.providerType === 'vehicle' ? 'Vehicle model' : 'Business / display name'} *
              </label>
              <input
                className="input-field"
                value={formData.businessName}
                onChange={(e) => updateField('businessName', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
              <input
                className="input-field"
                value={formData.district}
                onChange={(e) => updateField('district', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location / service area *</label>
              <input
                className="input-field"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.providerType === 'hotel' ? 'Price per night (Rs)' : 'Price per day (Rs)'} *
              </label>
              <input
                className="input-field"
                type="number"
                value={formData.price}
                onChange={(e) => updateField('price', e.target.value)}
                required
              />
            </div>
            {renderSpecificFields(formData, setFormData, formData.providerType)}
          </div>

          {/* Additional message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional message</label>
            <textarea
              className="input-field"
              rows="4"
              value={formData.message}
              onChange={(e) => updateField('message', e.target.value)}
            />
          </div>

          {/* Image upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-5">
            <input
              id="partner-images"
              className="hidden"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImages}
            />
            <label htmlFor="partner-images" className="cursor-pointer flex flex-col items-center text-gray-600">
              <Upload size={32} />
              <span className="mt-2 text-sm">Upload photos (max 5, 2MB each)</span>
            </label>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                {imagePreviews.map((src) => (
                  <img key={src} src={src} alt="Preview" className="h-24 w-full object-cover rounded-md" />
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="btn-primary w-full py-3"
          >
            {submitMutation.isPending ? 'Sending...' : 'Send Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PartnerRegister;