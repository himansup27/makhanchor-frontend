// src/components/RawMaterials/RawMaterialsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Download,
  Upload,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Loader,
  Filter,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import StatsCard from '../Dashboard/StatsCard';
import { rawMaterialsAPI } from '../../services/api';

const RawMaterialsPage = ({ type, config }) => {
  const [purchaseData, setPurchaseData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 10;
  
  // Filters
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');

  // Load data
  useEffect(() => {
    fetchPurchases();
    fetchStats();
  }, [type, currentPage, selectedMonth, selectedYear]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      if (selectedMonth) {
        params.month = selectedMonth;
      }
      if (selectedYear) {
        params.year = selectedYear;
      }

      const response = await rawMaterialsAPI.getByType(type, params);
      if (response.success) {
        setPurchaseData(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalRecords(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
      alert('Failed to load purchase data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;
      
      const response = await rawMaterialsAPI.getStats(type, params);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Handle Add Purchase
  const handleAddPurchase = async (formData) => {
    try {
      await rawMaterialsAPI.create(type, formData);
      alert('Purchase added successfully!');
      setShowAddModal(false);
      fetchPurchases();
      fetchStats();
    } catch (error) {
      console.error('Error adding purchase:', error);
      alert('Failed to add purchase');
    }
  };

  // Handle Edit Purchase
  const handleEditPurchase = async (formData) => {
    try {
      await rawMaterialsAPI.update(editingItem.id, formData);
      alert('Purchase updated successfully!');
      setShowEditModal(false);
      setEditingItem(null);
      fetchPurchases();
      fetchStats();
    } catch (error) {
      console.error('Error updating purchase:', error);
      alert('Failed to update purchase');
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase record?')) {
      try {
        await rawMaterialsAPI.delete(id);
        alert('Purchase deleted successfully!');
        fetchPurchases();
        fetchStats();
      } catch (error) {
        console.error('Error deleting purchase:', error);
        alert('Failed to delete purchase');
      }
    }
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
          
          // Date conversion logic (same as InventoryPage)
          if (typeof dateValue === 'number') {
            const excelEpoch = new Date(Date.UTC(1899, 11, 30));
            const jsDate = new Date(excelEpoch.getTime() + dateValue * 86400000);
            dateValue = jsDate.toISOString().split('T')[0];
          } else if (dateValue instanceof Date) {
            dateValue = dateValue.toISOString().split('T')[0];
          } else if (typeof dateValue === 'string') {
            const parts = dateValue.split(/[-/]/);
            if (parts.length === 3) {
              const day = parts[0].padStart(2, '0');
              const month = parts[1].padStart(2, '0');
              const year = parts[2];
              dateValue = `${year}-${month}-${day}`;
            }
          }

          const purchaseData = {
            date: dateValue || new Date().toISOString().split('T')[0],
            quantity: parseFloat(row.quantity) || 0,
          };

          // For Gas, handle big and small tanks
          if (type === 'gas') {
            purchaseData.bigTanks = parseFloat(row.bigTanks) || 0;
            purchaseData.smallTanks = parseFloat(row.smallTanks) || 0;
          }

          await rawMaterialsAPI.create(type, purchaseData);
        }

        alert('Excel data imported successfully!');
        fetchPurchases();
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
    const exportableData = purchaseData.map(item => ({
      Date: new Date(item.date).toLocaleDateString('en-IN'),
      ...(type === 'gas' 
        ? {
            'Big Tanks': item.bigTanks,
            'Small Tanks': item.smallTanks,
            'Total Tanks': (item.bigTanks || 0) + (item.smallTanks || 0),
          }
        : {
            Quantity: item.quantity,
            Unit: config.unit,
          }
      ),
    }));

    const ws = XLSX.utils.json_to_sheet(exportableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${config.name} Purchases`);
    XLSX.writeFile(wb, `${type}_purchases_${selectedMonth || 'all'}_${selectedYear}.xlsx`);
  };

  // Generate month options
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // Generate year options (last 5 years)
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Filter data by search term
  const filteredData = purchaseData.filter(item => {
    const dateStr = new Date(item.date).toLocaleDateString('en-IN');
    return dateStr.includes(searchTerm);
  });

  if (loading && purchaseData.length === 0) {
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
            {config.name} Purchases
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Track all {config.name.toLowerCase()} purchase records
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
            onClick={() => setShowAddModal(true)}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-all font-medium shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <Plus size={18} />
            Add Purchase
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title={`Total ${config.name} Purchased`}
          value={type === 'gas' 
            ? `${(stats?.totalBigTanks || 0) + (stats?.totalSmallTanks || 0)}`
            : stats?.totalPurchased || 0
          }
          subtitle={type === 'gas' 
            ? `Big: ${stats?.totalBigTanks || 0} | Small: ${stats?.totalSmallTanks || 0}`
            : `${config.unit}`
          }
          icon={config.icon}
          color={config.colorName}
        />
        <StatsCard
          title="Total Transactions"
          value={totalRecords}
          subtitle="Purchase records"
          icon={Calendar}
          color="blue"
        />
        <StatsCard
          title={selectedMonth ? `${months.find(m => m.value === selectedMonth)?.label} Purchases` : 'This Month'}
          value={type === 'gas'
            ? `${(stats?.monthlyBigTanks || 0) + (stats?.monthlySmallTanks || 0)}`
            : stats?.monthlyPurchased || 0
          }
          subtitle={type === 'gas'
            ? `Big: ${stats?.monthlyBigTanks || 0} | Small: ${stats?.monthlySmallTanks || 0}`
            : `${config.unit}`
          }
          icon={config.icon}
          color="green"
        />
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Months</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Date
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedMonth('');
                setSelectedYear(new Date().getFullYear());
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Purchase Records Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                {type === 'gas' ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Big Tanks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Small Tanks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total Tanks
                    </th>
                  </>
                ) : (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Quantity ({config.unit})
                  </th>
                )}
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={type === 'gas' ? 5 : 3} className="px-6 py-8 text-center">
                    <Loader className="animate-spin text-primary-500 mx-auto" size={32} />
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={type === 'gas' ? 5 : 3} className="px-6 py-8 text-center text-gray-500">
                    No purchase records found
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
                    {type === 'gas' ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            {item.bigTanks || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            {item.smallTanks || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-primary-600">
                            {(item.bigTanks || 0) + (item.smallTanks || 0)}
                          </span>
                        </td>
                      </>
                    ) : (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} records
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-primary-500 text-white'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <PurchaseModal
          config={config}
          type={type}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddPurchase}
        />
      )}

      {showEditModal && editingItem && (
        <PurchaseEditModal
          item={editingItem}
          config={config}
          type={type}
          onClose={() => {
            setShowEditModal(false);
            setEditingItem(null);
          }}
          onSubmit={handleEditPurchase}
        />
      )}
    </div>
  );
};

// Add Purchase Modal
const PurchaseModal = ({ config, type, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    bigTanks: '',
    smallTanks: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const submitData = {
      date: formData.date,
    };

    if (type === 'gas') {
      submitData.bigTanks = parseFloat(formData.bigTanks) || 0;
      submitData.smallTanks = parseFloat(formData.smallTanks) || 0;
    } else {
      submitData.quantity = parseFloat(formData.quantity) || 0;
    }

    await onSubmit(submitData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slide-in">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Add {config.name} Purchase</h3>
          <p className="text-sm text-gray-600 mt-1">Record new {config.name.toLowerCase()} purchase</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {type === 'gas' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Big Tanks
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={formData.bigTanks}
                  onChange={(e) => setFormData({ ...formData, bigTanks: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Small Tanks
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={formData.smallTanks}
                  onChange={(e) => setFormData({ ...formData, smallTanks: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 3"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity ({config.unit})
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={`e.g., 50`}
              />
              <p className="text-xs text-gray-500 mt-1">Number of {config.unit}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-500 text-white py-2.5 rounded-lg hover:bg-primary-600 font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Purchase'}
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

// Edit Purchase Modal
const PurchaseEditModal = ({ item, config, type, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: item.date.split('T')[0],
    quantity: item.quantity || '',
    bigTanks: item.bigTanks || '',
    smallTanks: item.smallTanks || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const submitData = {
      date: formData.date,
    };

    if (type === 'gas') {
      submitData.bigTanks = parseFloat(formData.bigTanks) || 0;
      submitData.smallTanks = parseFloat(formData.smallTanks) || 0;
    } else {
      submitData.quantity = parseFloat(formData.quantity) || 0;
    }

    await onSubmit(submitData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slide-in">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Edit {config.name} Purchase</h3>
          <p className="text-sm text-gray-600 mt-1">Update purchase details</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {type === 'gas' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Big Tanks
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={formData.bigTanks}
                  onChange={(e) => setFormData({ ...formData, bigTanks: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Small Tanks
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={formData.smallTanks}
                  onChange={(e) => setFormData({ ...formData, smallTanks: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity ({config.unit})
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
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
              {loading ? 'Updating...' : 'Update Purchase'}
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

export default RawMaterialsPage;