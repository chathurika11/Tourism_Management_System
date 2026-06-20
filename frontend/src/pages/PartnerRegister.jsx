import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Building2, Car, CheckCircle2, Clock, Search, Upload, UserRound, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import API, { getImageUrl } from '../services/api';

const initialForm = {
  providerType: 'guide',
  requesterName: '',
  requesterEmail: '',
  requesterPhone: '',
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

const statusStyles = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

const statusIcons = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
};

const getStoredRequestIds = () => {
  try {
    return JSON.parse(localStorage.getItem('providerRequestIds') || '[]');
  } catch {
    return [];
  }
};

const PartnerRegister = () => {
  const [formData, setFormData] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [requestIds, setRequestIds] = useState(getStoredRequestIds);
  const [lookupEmail, setLookupEmail] = useState('');
  const [emailToSearch, setEmailToSearch] = useState('');

  const idsQuery = useMemo(() => requestIds.join(','), [requestIds]);

  const { data: myRequests = [], refetch, isFetching } = useQuery({
    queryKey: ['my-provider-requests', idsQuery, emailToSearch],
    queryFn: async () => {
      if (!idsQuery && !emailToSearch) return [];
      const params = new URLSearchParams();
      if (idsQuery) params.set('ids', idsQuery);
      if (emailToSearch) params.set('email', emailToSearch);
      const res = await API.get(`/provider-requests/mine?${params.toString()}`);
      return res.data;
    },
    enabled: Boolean(idsQuery || emailToSearch),
  });

  const submitMutation = useMutation({
    mutationFn: (fd) => API.post('/provider-requests', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: (res) => {
      const nextIds = Array.from(new Set([res.data.id, ...requestIds]));
      setRequestIds(nextIds);
      localStorage.setItem('providerRequestIds', JSON.stringify(nextIds));
      toast.success('Request sent to admin/staff for review.');
      setFormData(initialForm);
      setImages([]);
      setImagePreviews([]);
      refetch();
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => fd.append(key, value));
    fd.append('pricePerDay', formData.price);
    fd.append('pricePerNight', formData.price);
    images.forEach((image) => fd.append('images', image));
    submitMutation.mutate(fd);
  };

  const handleLookup = (e) => {
    e.preventDefault();
    setEmailToSearch(lookupEmail.trim());
  };

  const renderSpecificFields = () => {
    if (formData.providerType === 'guide') {
      return (
        <>
          <input className="input-field" placeholder="Specialty (Cultural, Wildlife...)" value={formData.specialty} onChange={(e) => updateField('specialty', e.target.value)} required />
          <input className="input-field" placeholder="Languages" value={formData.language} onChange={(e) => updateField('language', e.target.value)} />
          <input className="input-field" placeholder="Experience (5 years)" value={formData.experience} onChange={(e) => updateField('experience', e.target.value)} />
          <input className="input-field" placeholder="Certification" value={formData.certification} onChange={(e) => updateField('certification', e.target.value)} />
        </>
      );
    }

    if (formData.providerType === 'hotel') {
      return (
        <>
          <textarea className="input-field md:col-span-2" rows="3" placeholder="Amenities (comma separated)" value={formData.amenities} onChange={(e) => updateField('amenities', e.target.value)} />
          <input className="input-field" placeholder="Check-in" value={formData.checkIn} onChange={(e) => updateField('checkIn', e.target.value)} />
          <input className="input-field" placeholder="Check-out" value={formData.checkOut} onChange={(e) => updateField('checkOut', e.target.value)} />
          <input className="input-field" type="number" placeholder="Free cancellation hours" value={formData.freeCancellationHours} onChange={(e) => updateField('freeCancellationHours', e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={formData.breakfastIncluded} onChange={(e) => updateField('breakfastIncluded', e.target.checked)} />
            Breakfast included
          </label>
        </>
      );
    }

    return (
      <>
        <input className="input-field" placeholder="Vehicle type (Car, Van...)" value={formData.type} onChange={(e) => updateField('type', e.target.value)} required />
        <input className="input-field" type="number" placeholder="Passengers" value={formData.passengers} onChange={(e) => updateField('passengers', e.target.value)} required />
        <input className="input-field" placeholder="Fuel type" value={formData.fuelType} onChange={(e) => updateField('fuelType', e.target.value)} />
        <input className="input-field" placeholder="Fuel efficiency" value={formData.fuelEfficiency} onChange={(e) => updateField('fuelEfficiency', e.target.value)} />
        <input className="input-field" placeholder="Year" value={formData.year} onChange={(e) => updateField('year', e.target.value)} />
        <input className="input-field" type="number" placeholder="Security deposit" value={formData.securityDeposit} onChange={(e) => updateField('securityDeposit', e.target.value)} />
        <textarea className="input-field md:col-span-2" rows="3" placeholder="Pickup locations (comma separated)" value={formData.pickupLocations} onChange={(e) => updateField('pickupLocations', e.target.value)} />
        <textarea className="input-field md:col-span-2" rows="3" placeholder="Included features (comma separated)" value={formData.includedFeatures} onChange={(e) => updateField('includedFeatures', e.target.value)} />
      </>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-primary text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Partner Registration</h1>
          <p className="text-white/80 max-w-2xl">Register as a guide, hotel, or vehicle partner. Your request appears in the admin/staff review queue before it is published.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-lg shadow p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {providerOptions.map((option) => {
              const Icon = option.icon;
              const active = formData.providerType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField('providerType', option.value)}
                  className={`border rounded-lg p-4 flex items-center justify-center gap-2 transition ${active ? 'border-primary bg-primary text-white' : 'border-gray-200 hover:border-primary text-gray-700'}`}
                >
                  <Icon size={20} /> {option.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="input-field" placeholder="Your name" value={formData.requesterName} onChange={(e) => updateField('requesterName', e.target.value)} required />
            <input className="input-field" type="email" placeholder="Email" value={formData.requesterEmail} onChange={(e) => updateField('requesterEmail', e.target.value)} required />
            <input className="input-field" placeholder="Phone" value={formData.requesterPhone} onChange={(e) => updateField('requesterPhone', e.target.value)} required />
            <input className="input-field" placeholder={formData.providerType === 'vehicle' ? 'Vehicle model' : 'Business / display name'} value={formData.businessName} onChange={(e) => updateField('businessName', e.target.value)} required />
            <input className="input-field" placeholder="District" value={formData.district} onChange={(e) => updateField('district', e.target.value)} required />
            <input className="input-field" placeholder="Location / service area" value={formData.location} onChange={(e) => updateField('location', e.target.value)} required />
            <input className="input-field" type="number" placeholder={formData.providerType === 'hotel' ? 'Price per night (Rs)' : 'Price per day (Rs)'} value={formData.price} onChange={(e) => updateField('price', e.target.value)} required />
            {renderSpecificFields()}
          </div>

          <textarea className="input-field" rows="4" placeholder="Tell us anything admin/staff should know" value={formData.message} onChange={(e) => updateField('message', e.target.value)} />

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-5">
            <input id="partner-images" className="hidden" type="file" accept="image/*" multiple onChange={handleImages} />
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

          <button type="submit" disabled={submitMutation.isPending} className="btn-primary w-full py-3">
            {submitMutation.isPending ? 'Sending...' : 'Send Request'}
          </button>
        </form>

        <aside className="space-y-6">
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-xl font-bold text-primary mb-3">Check Request Status</h2>
            <form onSubmit={handleLookup} className="flex gap-2">
              <input className="input-field" type="email" placeholder="Email address" value={lookupEmail} onChange={(e) => setLookupEmail(e.target.value)} />
              <button className="btn-primary px-4" aria-label="Search request status">
                <Search size={18} />
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-primary">Your Requests</h2>
              {isFetching && <span className="text-xs text-gray-500">Refreshing...</span>}
            </div>
            <div className="space-y-3">
              {myRequests.length === 0 && <p className="text-sm text-gray-500">Submitted requests from this browser or searched email will appear here.</p>}
              {myRequests.map((request) => {
                const StatusIcon = statusIcons[request.status] || Clock;
                return (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      {request.images?.[0] && <img src={getImageUrl(request.images[0])} alt={request.businessName} className="w-14 h-14 object-cover rounded-md" />}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-primary truncate">{request.businessName || request.requesterName}</p>
                        <p className="text-xs text-gray-500 capitalize">{request.providerType} request</p>
                        <span className={`inline-flex items-center gap-1 border rounded-full px-2 py-1 mt-2 text-xs capitalize ${statusStyles[request.status] || statusStyles.pending}`}>
                          <StatusIcon size={13} /> {request.status}
                        </span>
                      </div>
                    </div>
                    {request.status === 'rejected' && request.rejectionReason && (
                      <p className="text-sm text-red-600 mt-3">{request.rejectionReason}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PartnerRegister;
