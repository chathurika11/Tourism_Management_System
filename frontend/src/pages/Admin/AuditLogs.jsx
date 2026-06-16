import React, { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState('');
  const [action, setAction] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      const res = await API.get('/auth/logs', { params: { q: query, action } });
      setLogs(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load audit logs');
    }
  }, [query, action]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const actionOptions = [
    ['USER_CREATED', 'User Created'],
    ['USER_UPDATED', 'User Updated'],
    ['USER_DELETED', 'User Deleted'],
    ['ROLE_ASSIGNED', 'Role Assigned'],
    ['ROLE_REMOVED', 'Role Removed'],
    ['PASSWORD_CHANGED', 'Password Changed'],
    ['LOGIN_SUCCESS', 'Login Events'],
    ['HOTEL_CREATED', 'Hotel Created'],
    ['HOTEL_UPDATED', 'Hotel Updated'],
    ['HOTEL_DELETED', 'Hotel Deleted'],
    ['VEHICLE_CREATED', 'Vehicle Created'],
    ['VEHICLE_UPDATED', 'Vehicle Updated'],
    ['VEHICLE_DELETED', 'Vehicle Deleted'],
    ['GUIDE_CREATED', 'Guide Created'],
    ['GUIDE_UPDATED', 'Guide Updated'],
    ['GUIDE_DELETED', 'Guide Deleted'],
    ['PACKAGE_CREATED', 'Package Created'],
    ['PACKAGE_UPDATED', 'Package Updated'],
    ['PACKAGE_DELETED', 'Package Deleted'],
    ['DISTRICT_CREATED', 'Destination Created'],
    ['DISTRICT_UPDATED', 'Destination Updated'],
    ['DISTRICT_DELETED', 'Destination Deleted'],
    ['PLACE_CREATED', 'Place Created'],
    ['PLACE_UPDATED', 'Place Updated'],
    ['PLACE_DELETED', 'Place Deleted'],
    ['FEEDBACK_REPLIED', 'Feedback Replied'],
  ];

  const formatAction = (value) => value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const getActor = (log) => log.actor?.username || 'System';

  const describeByAction = (log) => {
    const name = log.metadata?.name || log.metadata?.username || log.entityId || '';
    const role = (log.metadata?.role || '').toString().toLowerCase();

    switch (log.action) {
      case 'LOGIN_SUCCESS':
        return `${getActor(log)} logged in`;
      case 'USER_CREATED':
        return role === 'staff'
          ? `Added staff member ${name}`
          : `Added ${role || 'user'} account ${name}`;
      case 'USER_UPDATED':
        return `Updated user ${name}`;
      case 'USER_DELETED':
        return `Deleted user ${name}`;
      case 'ROLE_ASSIGNED':
        return `Assigned ${role || 'role'} role`;
      case 'ROLE_REMOVED':
        return `Removed ${role || 'role'} role`;
      case 'PASSWORD_CHANGED':
        return `Changed password for ${name || getActor(log)}`;
      case 'HOTEL_CREATED':
        return `Added ${name} hotel`;
      case 'HOTEL_UPDATED':
        return `Updated ${name} hotel`;
      case 'HOTEL_DELETED':
        return `Deleted ${name} hotel`;
      case 'VEHICLE_CREATED':
        return `Added ${name} vehicle`;
      case 'VEHICLE_UPDATED':
        return `Updated ${name} vehicle`;
      case 'VEHICLE_DELETED':
        return `Deleted ${name} vehicle`;
      case 'GUIDE_CREATED':
        return `Added ${name} guide`;
      case 'GUIDE_UPDATED':
        return `Updated ${name} guide`;
      case 'GUIDE_DELETED':
        return `Deleted ${name} guide`;
      case 'PACKAGE_CREATED':
        return `Added ${name} tour package`;
      case 'PACKAGE_UPDATED':
        return `Updated ${name} tour package`;
      case 'PACKAGE_DELETED':
        return `Deleted ${name} tour package`;
      case 'DISTRICT_CREATED':
        return `Added ${name} destination`;
      case 'DISTRICT_UPDATED':
        return `Updated ${name} destination`;
      case 'DISTRICT_DELETED':
        return `Deleted ${name} destination`;
      case 'PLACE_CREATED':
        return `Added ${name} place`;
      case 'PLACE_UPDATED':
        return `Updated ${name} place`;
      case 'PLACE_DELETED':
        return `Deleted ${name} place`;
      case 'FEEDBACK_REPLIED':
        return `Replied to ${log.metadata?.feedbackType || 'customer'} feedback`;
      default:
        return formatAction(log.action);
    }
  };

  const getDetails = (log) => {
    if (log.metadata?.description) return log.metadata.description;
    return describeByAction(log);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Audit Logs</h1>
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-field pl-10" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search logs..." />
        </div>
        <select className="input-field md:w-56" value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">All Actions</option>
          {actionOptions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button onClick={fetchLogs} className="btn-primary">Filter</button>
      </div>
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3 text-sm font-medium">{formatAction(log.action)}</td>
                <td className="px-4 py-3 text-sm">{getActor(log)}</td>
                <td className="px-4 py-3 text-sm">{getDetails(log)}</td>
                <td className="px-4 py-3 text-sm">{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
