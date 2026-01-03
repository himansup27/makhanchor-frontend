// src/components/Production/ProductionPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Plus, 
  Calendar, 
  Package, 
  TrendingUp, 
  Download,
  Search,
  Filter,
  Edit,
  Trash2,
  Loader
} from 'lucide-react';
import StatsCard from '../Dashboard/StatsCard';
import { productionAPI } from '../../services/api';
import * as XLSX from 'xlsx';

const ProductionPage = () => {
  const [productionData, setProductionData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Load data from API on mount
  useEffect(() => {
    fetchProduction();
    fetchStats();
  }, []);

  const fetchProduction = async () => {
    try {
      setLoading(true);
      const response = await productionAPI.getAll({ limit: 100 });
      if (response.success) {
        setProductionData(response.data);
      }
    } catch (error) {
      console.error('Error fetching production:', error);
      alert('Failed to load production data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await productionAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Calculate stats
  const totalProduction = stats?.totalProduction || 0;
  const totalSales = stats?.totalSold || 0;
  const availableStock = stats?.totalRemaining || 0;
  const todayProduction = productionData.find(p => p.date.split('T')[0] === new Date().toISOString().split('T')[0]);
  const yesterdayProduction = productionData.find(p => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return p.date.split('T')[0] === yesterday.toISOString().split('T')[0];
  });

  // Filter data
  const filteredData = productionData.filter(item => {
  const matchesSearch = item.packets.toString().includes(searchTerm);
  const matchesDate = filterDate ? item.date.split('T')[0] === filterDate : true;
  return matchesSearch && matchesDate;
});

  // Add edit handler function
const handleEdit = (item) => {
  setEditingItem(item);
  setShowEditModal(true);
};

  // Handle Excel Upload - FIXED VERSION
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
        
        if (typeof dateValue === 'number') {
          const excelEpoch = new Date(Date.UTC(1899, 11, 30));
          const jsDate = new Date(excelEpoch.getTime() + dateValue * 86400000);
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
          const parts = dateValue.split(/[-/]/);
          if (parts.length === 3) {
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

        await productionAPI.create({
          date: dateValue,
          packets: parseFloat(row.packets) || 0,
          sold: parseFloat(row.sold) || 0,
        });
      }

      alert('Excel data imported successfully!');
      fetchProduction();
      fetchStats();
    } catch (error) {
      console.error('Error uploading Excel:', error);
      alert('Error reading Excel file. Please check the format.');
    }
  };
  reader.readAsBinaryString(file);
};

  // Download Excel Template
  const downloadTemplate = () => {
    const template = [
      { date: '', packets: 0, amount: 0, sold: 0 }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Production Template');
    XLSX.writeFile(wb, 'production_template.xlsx');
  };

  // Export Data
  const exportData = () => {
    const ws = XLSX.utils.json_to_sheet(productionData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Production Data');
    XLSX.writeFile(wb, 'production_data.xlsx');
  };

  // Delete entry
  const handleDelete = async (id) => {
    if (window.confirm('Delete this entry?')) {
      try {
        await productionAPI.delete(id);
        alert('Production record deleted successfully!');
        fetchProduction();
        fetchStats();
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Failed to delete production record');
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
          <h2 className="text-2xl font-bold text-gray-900">Production Management</h2>
          <p className="text-sm text-gray-600 mt-1">Track daily production and inventory</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={downloadTemplate}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={18} />
            Template
          </button>
          <button 
            onClick={exportData}
            className="btn-secondary flex items-center gap-2"
          >
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
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Production
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Today's Production"
          value={todayProduction?.packets || 0}
          subtitle="packets (16 dabba each)"
          icon={Package}
          trend="up"
          trendValue={yesterdayProduction ? `${Math.abs(((todayProduction?.packets || 0) - yesterdayProduction.packets) / yesterdayProduction.packets * 100).toFixed(1)}% from yesterday` : 'No comparison'}
          color="blue"
        />
        <StatsCard
          title="Yesterday's Remaining"
          value={yesterdayProduction?.remaining || 0}
          subtitle="packets unsold"
          icon={Package}
          color="purple"
        />
        <StatsCard
          title="Total Sales"
          value={totalSales}
          subtitle="packets sold (all time)"
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Available Stock"
          value={availableStock}
          subtitle="packets in inventory"
          icon={Package}
          trend={availableStock > 100 ? 'up' : 'down'}
          trendValue={`${availableStock > 100 ? 'Healthy' : 'Low'} stock level`}
          color="orange"
        />
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by packets or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Production Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
  <thead className="bg-gray-50 border-b border-gray-200">
    <tr>
      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
        Date
      </th>
      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
        Packets Produced
      </th>
      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
        Sold
      </th>
      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
        Remaining
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
          No production data found
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
                  year: 'numeric' 
                })}
              </span>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="text-sm font-bold text-blue-600">{item.packets}</span>
            <span className="text-xs text-gray-500 ml-1">packets</span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {item.sold} sold
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {item.remaining} remaining
            </span>
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

      {/* Add Production Modal */}
      {showModal && (
        <ProductionModal
          onClose={() => setShowModal(false)}
          onSubmit={async (data) => {
            try {
              await productionAPI.create(data);
              alert('Production added successfully!');
              fetchProduction();
              fetchStats();
              setShowModal(false);
            } catch (error) {
              console.error('Error creating production:', error);
              alert('Failed to add production');
            }
          }}
        />
      )}

{showEditModal && editingItem && (
  <ProductionEditModal
    item={editingItem}
    onClose={() => {
      setShowEditModal(false);
      setEditingItem(null);
    }}
    onSubmit={async (data) => {
      try {
        await productionAPI.update(editingItem.id, data);
        alert('Production updated successfully!');
        fetchProduction();
        fetchStats();
        setShowEditModal(false);
        setEditingItem(null);
      } catch (error) {
        console.error('Error updating production:', error);
        alert('Failed to update production');
      }
    }}
  />
)}
    </div>
  );
};

// Production Modal Component
const ProductionModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    packets: '',
    sold: '0',
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
          <h3 className="text-xl font-bold text-gray-900">Add Production Entry</h3>
          <p className="text-sm text-gray-600 mt-1">Enter today's production details</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
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
              Packets Produced (16 dabba each)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.packets}
              onChange={(e) => setFormData({ ...formData, packets: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., 16.2 (16 packets + 2 dabba)"
            />
            <p className="text-xs text-gray-500 mt-1">Use decimals: 16.2 = 16 packets + 2 dabba</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sold Today (Optional)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.sold}
              onChange={(e) => setFormData({ ...formData, sold: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter sold packets"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-500 text-white py-2.5 rounded-lg hover:bg-primary-600 font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Production'}
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

// Production Edit Modal Component
const ProductionEditModal = ({ item, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: item.date.split('T')[0],
    packets: item.packets,
    sold: item.sold,
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
          <h3 className="text-xl font-bold text-gray-900">Edit Production Entry</h3>
          <p className="text-sm text-gray-600 mt-1">Update production details</p>
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
              Packets Produced (16 dabba each)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.packets}
              onChange={(e) => setFormData({ ...formData, packets: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Use decimals: 16.2 = 16 packets + 2 dabba</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sold</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.sold}
              onChange={(e) => setFormData({ ...formData, sold: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-500 text-white py-2.5 rounded-lg hover:bg-primary-600 font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Production'}
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

export default ProductionPage;