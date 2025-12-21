// src/components/Settings/SettingsPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  User,
  Lock,
  Bell,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  Building,
  Calendar,
} from 'lucide-react';
import AlertBanner from '../Dashboard/AlertBanner';

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  const showNotification = (type, message) => {
    setAlertType(type);
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data Management', icon: Database },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-600 mt-1">Manage your account and application settings</p>
      </div>

      {/* Alert */}
      {showAlert && (
        <AlertBanner
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && <ProfileSettings user={user} updateProfile={updateProfile} showNotification={showNotification} />}
          {activeTab === 'security' && <SecuritySettings showNotification={showNotification} />}
          {activeTab === 'notifications' && <NotificationSettings showNotification={showNotification} />}
          {activeTab === 'data' && <DataManagement showNotification={showNotification} />}
        </div>
      </div>
    </div>
  );
};

// Profile Settings Component
const ProfileSettings = ({ user, updateProfile, showNotification }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    email: '',
    company: 'MakhanChor Biscuits',
    role: user?.role || 'Admin',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    showNotification('success', 'Profile updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="10-digit mobile number"
              maxLength="10"
              disabled
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Contact admin to change mobile number</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
            {formData.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{formData.name}</p>
            <p className="text-sm text-gray-600">{formData.role}</p>
            <p className="text-sm text-gray-500">{formData.mobile}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Save size={18} />
          Save Changes
        </button>
      </div>
    </form>
  );
};

// Security Settings Component
const SecuritySettings = ({ showNotification }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('error', 'New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showNotification('error', 'Password must be at least 6 characters long!');
      return;
    }

    // TODO: Call backend API to change password
    showNotification('success', 'Password changed successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">Password Requirements</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Minimum 6 characters long</li>
              <li>• Should contain letters and numbers</li>
              <li>• Avoid using common passwords</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handlePasswordChange} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter current password"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter new password"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Confirm new password"
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Lock size={18} />
            Change Password
          </button>
        </div>
      </form>

      <hr className="border-gray-200" />

      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Login Activity</h3>
        <div className="space-y-3">
          {[
            { device: 'Chrome on Windows', location: 'Bhubaneswar, India', time: '2 hours ago', active: true },
            { device: 'Mobile App', location: 'Bhubaneswar, India', time: '1 day ago', active: false },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${activity.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div>
                  <p className="font-medium text-gray-900">{activity.device}</p>
                  <p className="text-sm text-gray-600">{activity.location} • {activity.time}</p>
                </div>
              </div>
              {activity.active && (
                <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Active Now
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Notification Settings Component
const NotificationSettings = ({ showNotification }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    lowStockAlerts: true,
    dailyReports: true,
    salesAlerts: true,
    productionAlerts: false,
  });

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSave = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    showNotification('success', 'Notification settings saved successfully!');
  };

  const notificationOptions = [
    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
    { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive notifications via SMS' },
    { key: 'lowStockAlerts', label: 'Low Stock Alerts', description: 'Get notified when inventory is running low' },
    { key: 'dailyReports', label: 'Daily Reports', description: 'Receive daily summary reports' },
    { key: 'salesAlerts', label: 'Sales Alerts', description: 'Get notified about new sales' },
    { key: 'productionAlerts', label: 'Production Alerts', description: 'Get notified about production updates' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {notificationOptions.map((option) => (
          <div key={option.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{option.label}</p>
              <p className="text-sm text-gray-600">{option.description}</p>
            </div>
            <button
              onClick={() => handleToggle(option.key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings[option.key] ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings[option.key] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <Save size={18} />
          Save Preferences
        </button>
      </div>
    </div>
  );
};

// Data Management Component
const DataManagement = ({ showNotification }) => {
  const handleExportData = () => {
    // Export all data
    const allData = {
      production: JSON.parse(localStorage.getItem('productionData') || '[]'),
      sales: JSON.parse(localStorage.getItem('salesData') || '[]'),
      maida: JSON.parse(localStorage.getItem('maidaData') || '[]'),
      oil: JSON.parse(localStorage.getItem('oilData') || '[]'),
      ghee: JSON.parse(localStorage.getItem('gheeData') || '[]'),
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `makhanchor_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('success', 'Data exported successfully!');
  };

  const handleClearData = (type) => {
    if (window.confirm(`Are you sure you want to clear all ${type} data? This action cannot be undone.`)) {
      localStorage.removeItem(`${type}Data`);
      showNotification('success', `${type.charAt(0).toUpperCase() + type.slice(1)} data cleared successfully!`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Backup & Export</h3>
        <div className="space-y-3">
          <button
            onClick={handleExportData}
            className="w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Download className="text-blue-600" size={20} />
              <div className="text-left">
                <p className="font-medium text-blue-900">Export All Data</p>
                <p className="text-sm text-blue-700">Download complete backup as JSON file</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <hr className="border-gray-200" />

      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Clear Data</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-semibold text-yellow-900 mb-1">Warning</p>
              <p className="text-sm text-yellow-800">
                Clearing data will permanently delete all records. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
      {['production', 'sales', 'maida', 'oil', 'ghee'].map((type) => (
        <button
          key={type}
          onClick={() => handleClearData(type)}
          className="w-full flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Trash2 className="text-red-600" size={20} />
            <div className="text-left">
              <p className="font-medium text-red-900">Clear {type.charAt(0).toUpperCase() + type.slice(1)} Data</p>
              <p className="text-sm text-red-700">Delete all {type} records</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>

  <hr className="border-gray-200" />

  <div>
    <h3 className="font-semibold text-gray-900 mb-4">Storage Information</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { label: 'Production Records', count: JSON.parse(localStorage.getItem('productionData') || '[]').length },
        { label: 'Sales Records', count: JSON.parse(localStorage.getItem('salesData') || '[]').length },
        { label: 'Inventory Entries', count: 
          JSON.parse(localStorage.getItem('maidaData') || '[]').length +
          JSON.parse(localStorage.getItem('oilData') || '[]').length +
          JSON.parse(localStorage.getItem('gheeData') || '[]').length
        },
      ].map((item, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">{item.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{item.count}</p>
        </div>
      ))}
    </div>
  </div>
</div>
);
};
export default SettingsPage;