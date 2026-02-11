// src/components/Sales/SalesPage.jsx
import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Download,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Edit,
  Trash2,
  Loader,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Pagination } from 'antd';
import 'antd/dist/reset.css';
import StatsCard from '../Dashboard/StatsCard';
import { salesAPI } from '../../services/api';
import * as XLSX from 'xlsx';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const SalesPage = () => {
  const [salesData, setSalesData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);

  // Load data from API
  useEffect(() => {
    fetchSales();
    fetchStats();
  }, [currentPage, pageSize]);

  const fetchSales = async () => {
  try {
    setLoading(true);
    const response = await salesAPI.getAll({ 
      page: currentPage,
      limit: pageSize 
    });
    if (response.success) {
      setSalesData(response.data);
      setTotalRecords(response.pagination?.total || 0);
    }
  } catch (error) {
    console.error('Error fetching sales:', error);
    alert('Failed to load sales data');
  } finally {
    setLoading(false);
  }
};

  const fetchStats = async () => {
    try {
      const response = await salesAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Pagination handlers
const handlePageChange = (page, newPageSize) => {
  setCurrentPage(page);
  if (newPageSize !== pageSize) {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  }
};

  // Calculate stats
  const totalSales = stats?.totalSales || 0;
  const todaySales = salesData.find(s => s.date.split('T')[0] === new Date().toISOString().split('T')[0]);

  // Chart data (last 7 days)
const chartData = Object.values(
  salesData.reduce((acc, s) => {
    const dateKey = new Date(s.date).toISOString().split('T')[0];
    const displayDate = new Date(s.date).toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short' 
    });
    
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: displayDate,
        packets: 0,
      };
    }
    
    acc[dateKey].packets += s.packets;
    
    return acc;
  }, {})
)
  .sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  })
  .slice(-7);

  // Filter data
  const filteredData = salesData.filter(item => {
  const matchesSearch = 
    item.packets.toString().includes(searchTerm) ||
    (item.customer && item.customer.toLowerCase().includes(searchTerm.toLowerCase()));
  const matchesDate = filterDate ? item.date.split('T')[0] === filterDate : true;
  return matchesSearch && matchesDate;
});

  const handleEdit = (item) => {
  setEditingItem(item);
  setShowEditModal(true);
};

  // Export Data
  const exportData = () => {
    const ws = XLSX.utils.json_to_sheet(salesData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Data');
    XLSX.writeFile(wb, 'sales_data.xlsx');
  };

  // Delete entry
  const handleDelete = async (id) => {
    if (window.confirm('Delete this sale?')) {
      try {
        await salesAPI.delete(id);
        alert('Sales record deleted successfully!');
        fetchSales();
        fetchStats();
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Failed to delete sales record');
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
          <h2 className="text-2xl font-bold text-gray-900">Sales Management</h2>
          <p className="text-sm text-gray-600 mt-1">Track daily sales and revenue</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportData} className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Sale
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <StatsCard
    title="Today's Sales"
    value={todaySales?.packets || 0}
    subtitle="packets sold"
    icon={ShoppingCart}
    trend="up"
    trendValue="+12% from yesterday"
    color="green"
  />
  <StatsCard
    title="Total Sales"
    value={totalSales}
    subtitle="all time packets"
    icon={TrendingUp}
    color="purple"
  />
  <StatsCard
    title="Average Sale"
    value={(salesData.length > 0 ? (totalSales / salesData.length).toFixed(1) : 0)}
    subtitle="packets per transaction"
    icon={Users}
    color="orange"
  />
</div>

      {/* Charts */}
<div className="grid grid-cols-1 gap-6">
  {/* Sales Trend */}
  <div className="card p-6">
    <h3 className="text-lg font-bold text-gray-900 mb-4">Sales Trend (Last 7 Days)</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="packets"
          stroke="#10b981"
          strokeWidth={3}
          name="Packets Sold"
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by customer, packets, or amount..."
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

      {/* Sales Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
  <thead className="bg-gray-50 border-b border-gray-200">
    <tr>
      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
        Date
      </th>
      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
        Customer
      </th>
      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
        Packets Sold
      </th>
      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
        Actions
      </th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-200">
    {filteredData.length === 0 ? (
      <tr>
        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
          No sales data found
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-xs">
                {item.customer ? item.customer.charAt(0) : 'C'}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {item.customer || 'Walk-in Customer'}
              </span>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="text-sm font-bold text-green-600">{item.packets}</span>
            <span className="text-xs text-gray-500 ml-1">packets</span>
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

      {/* Ant Design Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-center">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalRecords}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
            showSizeChanger
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} records`}
            pageSizeOptions={['10', '20', '50', '100']}
            showQuickJumper
          />
        </div>

      {/* Add Sale Modal */}
      {showModal && (
        <SalesModal
          onClose={() => setShowModal(false)}
          onSubmit={async (data) => {
            try {
              await salesAPI.create(data);
              alert('Sale added successfully!');
              fetchSales();
              fetchStats();
              setShowModal(false);
            } catch (error) {
              console.error('Error creating sale:', error);
              alert('Failed to add sale');
            }
          }}
        />
      )}

{showEditModal && editingItem && (
  <SalesEditModal
    item={editingItem}
    onClose={() => {
      setShowEditModal(false);
      setEditingItem(null);
    }}
    onSubmit={async (data) => {
      try {
        await salesAPI.update(editingItem.id, data);
        alert('Sales record updated successfully!');
        fetchSales();
        fetchStats();
        setShowEditModal(false);
        setEditingItem(null);
      } catch (error) {
        console.error('Error updating sale:', error);
        alert('Failed to update sale');
      }
    }}
  />
)}
    </div>
  );
};

// Sales Modal
const SalesModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    packets: '',
    customer: '',
  });
  const [loading, setLoading] = useState(false);

  const validatePacketInput = (value) => {
  const num = parseFloat(value);
  const decimal = Math.round((num - Math.floor(num)) * 100);
  if (decimal > 15) {
    alert('Dabba count cannot exceed 15. Please use format: packets.dabbas (e.g., 5.15 for 5 packets and 15 dabbas)');
    return false;
  }
  return true;
};

// In SalesModal handleSubmit:
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validatePacketInput(formData.packets)) return;
  
  setLoading(true);
  await onSubmit(formData);
  setLoading(false);
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slide-in">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Add Sales Entry</h3>
          <p className="text-sm text-gray-600 mt-1">Record a new sale</p>
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
              Customer Name (Optional)
            </label>
            <input
              type="text"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Packets Sold</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.packets}
              onChange={(e) => setFormData({ ...formData, packets: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., 5.5 (5 packets + 5 dabba)"
            />
            <p className="text-xs text-gray-500 mt-1">Use decimals: 5.5 = 5 packets + 5 dabba</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-500 text-white py-2.5 rounded-lg hover:bg-primary-600 font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Sale'}
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

// Sales Edit Modal
const SalesEditModal = ({ item, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: item.date.split('T')[0],
    packets: item.packets,
    customer: item.customer || '',
  });
  const [loading, setLoading] = useState(false);

  const validatePacketInput = (value) => {
  const num = parseFloat(value);
  const decimal = Math.round((num - Math.floor(num)) * 100);
  if (decimal > 15) {
    alert('Dabba count cannot exceed 15. Please use format: packets.dabbas (e.g., 5.15 for 5 packets and 15 dabbas)');
    return false;
  }
  return true;
};

// In SalesModal handleSubmit:
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validatePacketInput(formData.packets)) return;
  
  setLoading(true);
  await onSubmit(formData);
  setLoading(false);
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slide-in">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Edit Sales Entry</h3>
          <p className="text-sm text-gray-600 mt-1">Update sales details</p>
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
              Customer Name (Optional)
            </label>
            <input
              type="text"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Packets Sold</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.packets}
              onChange={(e) => setFormData({ ...formData, packets: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Use decimals: 5.5 = 5 packets + 5 dabba</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-500 text-white py-2.5 rounded-lg hover:bg-primary-600 font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Sale'}
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

export default SalesPage;