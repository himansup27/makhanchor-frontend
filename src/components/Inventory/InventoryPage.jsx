// src/components/Inventory/InventoryPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Upload,
  Plus,
  Download,
  Search,
  Calendar,
  TrendingDown,
  TrendingUp,
  Package,
  AlertTriangle,
  Edit,
  Trash2,
  Loader,
} from 'lucide-react';
import StatsCard from '../Dashboard/StatsCard';
import AlertBanner from '../Dashboard/AlertBanner';
import { inventoryAPI } from '../../services/api';
import * as XLSX from 'xlsx';

const InventoryPage = ({ type, config }) => {
  const [inventoryData, setInventoryData] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Load data from API
  useEffect(() => {
    fetchInventory();
    fetchStats();
  }, [type]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getByCategory(type, { limit: 100 });
      if (response.success) {
        setInventoryData(response.data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      alert('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await inventoryAPI.getCategoryStats(type);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Calculate inventory stats
  const totalImported = stats?.totalImported || 0;
  const totalConsumed = stats?.totalConsumed || 0;
  const currentStock = stats?.currentStock || 0;

  const yesterdayConsumption = inventoryData.find(item => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return item.date.split('T')[0] === yesterday.toISOString().split('T')[0] && item.type === 'consumption';
  });

  const todayConsumption = inventoryData.find(item => 
    item.date.split('T')[0] === new Date().toISOString().split('T')[0] && item.type === 'consumption'
  );

  // Filter data
  const filteredData = inventoryData.filter(item => {
    const matchesSearch = item.quantity.toString().includes(searchTerm) || 
                         (item.amount && item.amount.toString().includes(searchTerm));
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Low stock alert
  const isLowStock = currentStock < config.lowStockThreshold;

  // Add edit handler function
const handleEdit = (item) => {
  setEditingItem(item);
  setShowEditModal(true);
};

  // Handle Excel Upload
  const handleExcelUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      for (const row of data) {
        let dateValue = row.date;
        
        // Check if date is a number (Excel serial date)
        if (typeof dateValue === 'number') {
          // Convert Excel serial date to JavaScript date
          const excelEpoch = new Date(Date.UTC(1899, 11, 30));
          const jsDate = new Date(excelEpoch.getTime() + dateValue * 86400000);
          // Format as YYYY-MM-DD in local timezone
          const year = jsDate.getUTCFullYear();
          const month = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
          const day = String(jsDate.getUTCDate()).padStart(2, '0');
          dateValue = `${year}-${month}-${day}`;
        } else if (dateValue instanceof Date) {
          const year = dateValue.getFullYear();
          const month = String(dateValue.getMonth() + 1).padStart(2, '0');
          const day = String(dateValue.getDate()).padStart(2, '0');
          dateValue = `${year}-${month}-${day}`;
        } else if (typeof dateValue === 'string') {
          // Parse DD-MM-YYYY or other formats
          const parts = dateValue.split(/[-/]/);
          if (parts.length === 3) {
            // Assume DD-MM-YYYY format
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            dateValue = `${year}-${month}-${day}`;
          } else {
            dateValue = new Date().toISOString().split('T')[0];
          }
        } else {
          dateValue = new Date().toISOString().split('T')[0];
        }

        await inventoryAPI.create(type, {
          date: dateValue,
          type: row.type || 'import',
          quantity: parseInt(row.quantity) || 0,
          unit: config.unit,
          amount: row.amount ? parseFloat(row.amount) : null,
        });
      }

      alert('Excel data imported successfully!');
      fetchInventory();
      fetchStats();
    } catch (error) {
      console.error('Error uploading Excel:', error);
      alert('Error reading Excel file. Please check the format.');
    }
  };
  reader.readAsBinaryString(file);
};

  // Export Data
  const exportData = () => {
    const ws = XLSX.utils.json_to_sheet(inventoryData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${config.name} Data`);
    XLSX.writeFile(wb, `${type}_inventory_data.xlsx`);
  };

  // Delete entry
  const handleDelete = async (id) => {
    if (window.confirm('Delete this entry?')) {
      try {
        await inventoryAPI.delete(id);
        alert('Inventory entry deleted successfully!');
        fetchInventory();
        fetchStats();
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Failed to delete inventory entry');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-primary-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {config.icon && <config.icon size={32} className={config.color} />}
            {config.name} Inventory
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Track imports and daily consumption of {config.name.toLowerCase()}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportData} className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
          <label className="btn-secondary flex items-center gap-2 cursor-pointer">
            <Upload size={18} />
            Upload Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setShowConsumptionModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all font-medium shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <TrendingDown size={18} />
            Update Consumption
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Import
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {isLowStock && (
        <AlertBanner
          type="warning"
          title="Low Stock Alert"
          message={`${config.name} stock is running low! Current stock: ${currentStock} ${config.unit}`}
          action={() => setShowImportModal(true)}
          actionLabel="Add Import Now"
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Imported"
          value={totalImported}
          subtitle={`${config.unit} (${config.unitSize} each)`}
          icon={Package}
          color="green"
        />
        <StatsCard
          title="Total Consumed"
          value={totalConsumed}
          subtitle={`${config.unit} used`}
          icon={TrendingDown}
          color="red"
        />
        <StatsCard
          title="Current Stock"
          value={currentStock}
          subtitle={`${config.unit} available`}
          icon={config.icon}
          trend={currentStock > config.lowStockThreshold ? 'up' : 'down'}
          trendValue={currentStock > config.lowStockThreshold ? 'Healthy stock' : 'Low stock'}
          color={config.colorName}
        />
      </div>

      {/* Consumption Overview */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Consumption Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium mb-1">Yesterday's Consumption</p>
            <p className="text-2xl font-bold text-blue-900">
              {yesterdayConsumption?.quantity || 0}
            </p>
            <p className="text-xs text-blue-600 mt-1">{config.unit}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium mb-1">Today's Consumption</p>
            <p className="text-2xl font-bold text-green-900">
              {todayConsumption?.quantity || 0}
            </p>
            <p className="text-xs text-green-600 mt-1">{config.unit}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="text-sm text-amber-600 font-medium mb-1">Average Daily</p>
            <p className="text-2xl font-bold text-amber-900">
              {totalConsumed > 0 ? Math.round(totalConsumed / Math.max(inventoryData.filter(i => i.type === 'consumption').length, 1)) : 0}
            </p>
            <p className="text-xs text-amber-600 mt-1">{config.unit} per day</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by quantity or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterType === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('import')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterType === 'import'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Imports
            </button>
            <button
              onClick={() => setFilterType('consumption')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterType === 'consumption'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Consumption
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No inventory data found
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(item.date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.type === 'import' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <TrendingUp size={12} />
                          Import
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <TrendingDown size={12} />
                          Consumption
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">{item.quantity}</span>
                      <span className="text-xs text-gray-500 ml-1">{config.unit}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.amount ? (
                        <span className="text-sm font-semibold text-gray-900">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 mr-3">
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showImportModal && (
        <ImportModal
          config={config}
          onClose={() => setShowImportModal(false)}
          onSubmit={async (data) => {
            try {
              await inventoryAPI.create(type, {
                ...data,
                unit: config.unit,
              });
              alert('Import added successfully!');
              fetchInventory();
              fetchStats();
              setShowImportModal(false);
            } catch (error) {
              console.error('Error creating import:', error);
              alert('Failed to add import');
            }
          }}
        />
      )}

      {showConsumptionModal && (
        <ConsumptionModal
          config={config}
          onClose={() => setShowConsumptionModal(false)}
          onSubmit={async (data) => {
            try {
              await inventoryAPI.create(type, {
                ...data,
                unit: config.unit,
              });
              alert('Consumption updated successfully!');
              fetchInventory();
              fetchStats();
              setShowConsumptionModal(false);
            } catch (error) {
              console.error('Error updating consumption:', error);
              alert('Failed to update consumption');
            }
          }}
        />
      )}

{showEditModal && editingItem && (
  <InventoryEditModal
    item={editingItem}
    config={config}
    onClose={() => {
      setShowEditModal(false);
      setEditingItem(null);
    }}
    onSubmit={async (data) => {
      try {
        await inventoryAPI.update(editingItem.id, data);
        alert('Inventory entry updated successfully!');
        fetchInventory();
        fetchStats();
        setShowEditModal(false);
        setEditingItem(null);
      } catch (error) {
        console.error('Error updating inventory:', error);
        alert('Failed to update inventory entry');
      }
    }}
  />
)}
    </div>
  );
};

// Import Modal
const ImportModal = ({ config, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    amount: '',
    type: 'import',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slide-in">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Add {config.name} Import</h3>
          <p className="text-sm text-gray-600 mt-1">Record new {config.name.toLowerCase()} stock arrival</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity ({config.unitSize} each)
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={`Enter number of ${config.unit}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Amount (₹)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter total amount"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-500 text-white py-2.5 rounded-lg hover:bg-primary-600 font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Import'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Consumption Modal
const ConsumptionModal = ({ config, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    type: 'consumption',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slide-in">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Update {config.name} Consumption</h3>
          <p className="text-sm text-gray-600 mt-1">Record daily {config.name.toLowerCase()} usage</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity Used ({config.unitSize} each)
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={`Enter ${config.unit} consumed`}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This will be deducted from your current stock
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Consumption'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Inventory Edit Modal
const InventoryEditModal = ({ item, config, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: item.date.split('T')[0],
    type: item.type,
    quantity: item.quantity,
    amount: item.amount || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slide-in">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Edit {config.name} Entry</h3>
          <p className="text-sm text-gray-600 mt-1">Update inventory details</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="import">Import</option>
              <option value="consumption">Consumption</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity ({config.unitSize} each)
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {formData.type === 'import' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-500 text-white py-2.5 rounded-lg hover:bg-primary-600 font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Entry'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryPage;