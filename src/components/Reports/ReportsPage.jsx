// src/components/Reports/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  Download,
  FileText,
  DollarSign,
  Package,
  ShoppingCart,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
  Loader,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { productionAPI, salesAPI, inventoryAPI } from '../../services/api';
import * as XLSX from 'xlsx';

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState('last7days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load data on mount and when date range changes
  useEffect(() => {
    generateReport();
  }, [dateRange, startDate, endDate]);

  const generateReport = async () => {
    setLoading(true);
    
    try {
      // Calculate date range
      const dates = getDateRange();
      const params = {
        startDate: dates.start,
        endDate: dates.end,
      };

      // Fetch all data in parallel
      const [prodStats, prodData, saleStats, saleData, invStats] = await Promise.all([
        productionAPI.getStats(params),
        productionAPI.getAll({ ...params, limit: 1000 }),
        salesAPI.getStats(params),
        salesAPI.getAll({ ...params, limit: 1000 }),
        inventoryAPI.getAllStats(),
      ]);

      // Process data
      const production = prodData.success ? prodData.data : [];
      const sales = saleData.success ? saleData.data : [];

      // Calculate metrics
      const metrics = calculateMetrics(
        prodStats.success ? prodStats.data : {},
        saleStats.success ? saleStats.data : {},
        invStats.success ? invStats.data : {},
        production,
        sales
      );

      setReportData(metrics);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    let start, end;

    switch (dateRange) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'last7days':
        start = new Date(now.setDate(now.getDate() - 7));
        end = new Date();
        break;
      case 'last30days':
        start = new Date(now.setDate(now.getDate() - 30));
        end = new Date();
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date();
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'custom':
        if (startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
        } else {
          start = new Date(now.setDate(now.getDate() - 7));
          end = new Date();
        }
        break;
      default:
        start = new Date(now.setDate(now.getDate() - 7));
        end = new Date();
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const calculateMetrics = (prodStats, saleStats, invStats, production, sales) => {
    // Production metrics
    const totalProduction = prodStats.totalProduction || 0;
    const totalProductionValue = prodStats.totalAmount || 0;
    const avgDailyProduction = prodStats.avgDailyProduction || 0;

    // Sales metrics
    const totalSales = saleStats.totalSales || 0;
    const totalRevenue = saleStats.totalRevenue || 0;
    const avgDailySales = saleStats.avgSalePackets || 0;
    const avgOrderValue = saleStats.avgSaleAmount || 0;

    // Inventory metrics
    const maidaStock = invStats?.maida?.currentStock || 0;
    const oilStock = invStats?.oil?.currentStock || 0;
    const gheeStock = invStats?.ghee?.currentStock || 0;
    const totalInventoryCost = (invStats?.maida?.totalCost || 0) + 
                               (invStats?.oil?.totalCost || 0) + 
                               (invStats?.ghee?.totalCost || 0);

    // Performance metrics
    const soldPercentage = totalProduction > 0 ? (totalSales / totalProduction) * 100 : 0;
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalProductionValue - totalInventoryCost) / totalRevenue) * 100 : 0;

    // Daily trends
    const dailyData = {};
    production.forEach(p => {
      const date = p.date.split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, production: 0, sales: 0, revenue: 0 };
      }
      dailyData[date].production += p.packets;
    });
    sales.forEach(s => {
      const date = s.date.split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, production: 0, sales: 0, revenue: 0 };
      }
      dailyData[date].sales += s.packets;
      dailyData[date].revenue += s.amount;
    });

    const trendData = Object.values(dailyData)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(d => ({
        date: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        production: d.production,
        sales: d.sales,
        revenue: d.revenue / 1000,
      }));

    // Inventory distribution
    const inventoryDistribution = [
      { name: 'Maida', value: maidaStock, cost: invStats?.maida?.totalCost || 0, color: '#f59e0b' },
      { name: 'Oil', value: oilStock, cost: invStats?.oil?.totalCost || 0, color: '#eab308' },
      { name: 'Ghee', value: gheeStock, cost: invStats?.ghee?.totalCost || 0, color: '#f97316' },
    ];

    // Top customers
    const customerSales = {};
    sales.forEach(s => {
      const customer = s.customer || 'Walk-in';
      if (!customerSales[customer]) {
        customerSales[customer] = { name: customer, packets: 0, revenue: 0 };
      }
      customerSales[customer].packets += s.packets;
      customerSales[customer].revenue += s.amount;
    });
    const topCustomers = Object.values(customerSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      // Summary
      totalProduction,
      totalSales,
      totalRevenue,
      totalInventoryCost,
      soldPercentage,
      profitMargin,
      avgDailyProduction,
      avgDailySales,
      avgOrderValue,
      
      // Inventory
      maidaStock,
      oilStock,
      gheeStock,
      inventoryDistribution,
      
      // Charts
      trendData,
      topCustomers,
    };
  };

  // Export comprehensive report
  const exportReport = () => {
    if (!reportData) return;

    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['MakhanChor Biscuits - Comprehensive Report'],
      ['Generated on:', new Date().toLocaleString('en-IN')],
      ['Period:', dateRange === 'custom' ? `${startDate} to ${endDate}` : dateRange],
      [],
      ['PRODUCTION SUMMARY'],
      ['Total Production:', reportData.totalProduction, 'packets'],
      ['Average Daily Production:', reportData.avgDailyProduction.toFixed(2), 'packets'],
      [],
      ['SALES SUMMARY'],
      ['Total Sales:', reportData.totalSales, 'packets'],
      ['Total Revenue:', '₹' + reportData.totalRevenue.toLocaleString('en-IN')],
      ['Average Daily Sales:', reportData.avgDailySales.toFixed(2), 'packets'],
      ['Average Order Value:', '₹' + reportData.avgOrderValue.toLocaleString('en-IN')],
      [],
      ['INVENTORY SUMMARY'],
      ['Maida Stock:', reportData.maidaStock, 'packets'],
      ['Oil Stock:', reportData.oilStock, 'tins'],
      ['Ghee Stock:', reportData.gheeStock, 'dabba'],
      ['Total Inventory Cost:', '₹' + reportData.totalInventoryCost.toLocaleString('en-IN')],
      [],
      ['PERFORMANCE METRICS'],
      ['Sold Percentage:', reportData.soldPercentage.toFixed(2) + '%'],
      ['Profit Margin:', reportData.profitMargin.toFixed(2) + '%'],
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

    // Trend data sheet
    const ws2 = XLSX.utils.json_to_sheet(reportData.trendData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Daily Trends');

    // Top customers sheet
    if (reportData.topCustomers.length > 0) {
      const ws3 = XLSX.utils.json_to_sheet(reportData.topCustomers);
      XLSX.utils.book_append_sheet(wb, ws3, 'Top Customers');
    }

    XLSX.writeFile(wb, `MakhanChor_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-primary-500" size={48} />
          <p className="text-gray-600">Generating report...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">Comprehensive business insights and trends</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generateReport}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            onClick={exportReport}
            className="btn-primary flex items-center gap-2"
          >
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Calendar className="text-gray-400" size={20} />
          <span className="text-sm font-medium text-gray-700">Period:</span>
          
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'today', label: 'Today' },
              { value: 'last7days', label: 'Last 7 Days' },
              { value: 'last30days', label: 'Last 30 Days' },
              { value: 'thisMonth', label: 'This Month' },
              { value: 'lastMonth', label: 'Last Month' },
              { value: 'custom', label: 'Custom' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  dateRange === option.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div className="flex gap-3 items-center ml-4">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <Package className="text-blue-600" size={32} />
            <span className="text-xs font-medium bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
              Production
            </span>
          </div>
          <h3 className="text-3xl font-bold text-blue-900">{reportData.totalProduction}</h3>
          <p className="text-sm text-blue-600 mt-1">Total packets produced</p>
          <p className="text-xs text-blue-500 mt-2">
            Avg: {reportData.avgDailyProduction.toFixed(1)} packets/day
          </p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <ShoppingCart className="text-green-600" size={32} />
            <span className="text-xs font-medium bg-green-200 text-green-800 px-2 py-1 rounded-full">
              Sales
            </span>
          </div>
          <h3 className="text-3xl font-bold text-green-900">{reportData.totalSales}</h3>
          <p className="text-sm text-green-600 mt-1">Total packets sold</p>
          <p className="text-xs text-green-500 mt-2">
            {reportData.soldPercentage.toFixed(1)}% of production
          </p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="text-purple-600" size={32} />
            <span className="text-xs font-medium bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
              Revenue
            </span>
          </div>
          <h3 className="text-3xl font-bold text-purple-900">
            ₹{(reportData.totalRevenue / 1000).toFixed(0)}K
          </h3>
          <p className="text-sm text-purple-600 mt-1">Total revenue</p>
          <p className="text-xs text-purple-500 mt-2">
            Avg order: ₹{reportData.avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="text-orange-600" size={32} />
            <span className="text-xs font-medium bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
              Profit Margin
            </span>
          </div>
          <h3 className="text-3xl font-bold text-orange-900">
            {reportData.profitMargin.toFixed(1)}%
          </h3>
          <p className="text-sm text-orange-600 mt-1">Estimated margin</p>
          <p className="text-xs text-orange-500 mt-2">
            After inventory costs
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production & Sales Trend */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Production vs Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={reportData.trendData}>
              <defs>
                <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="production"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorProduction)"
                strokeWidth={2}
                name="Production"
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorSales)"
                strokeWidth={2}
                name="Sales"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend (₹ in thousands)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar
                dataKey="revenue"
                fill="#8b5cf6"
                radius={[8, 8, 0, 0]}
                name="Revenue (₹K)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Inventory Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={reportData.inventoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {reportData.inventoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {reportData.inventoryDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="font-medium text-gray-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{item.value} units</div>
                  <div className="text-xs text-gray-500">
                    ₹{item.cost.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Customers</h3>
          {reportData.topCustomers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No customer data available</p>
          ) : (
            <div className="space-y-4">
              {reportData.topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900">{customer.name}</span>
                      <span className="text-sm font-bold text-green-600">
                        ₹{customer.revenue.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(customer.revenue / reportData.topCustomers[0].revenue) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{customer.packets} packets</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Detailed Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Production Metrics */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Package size={18} className="text-blue-500" />
              Production Metrics
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Production:</span>
                <span className="font-semibold">{reportData.totalProduction} packets</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Daily:</span>
                <span className="font-semibold">{reportData.avgDailyProduction.toFixed(2)} packets</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sold Percentage:</span>
                <span className="font-semibold text-green-600">{reportData.soldPercentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Sales Metrics */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <ShoppingCart size={18} className="text-green-500" />
              Sales Metrics
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Sales:</span>
                <span className="font-semibold">{reportData.totalSales} packets</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Revenue:</span>
                <span className="font-semibold">₹{reportData.totalRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Order Value:</span>
                <span className="font-semibold">₹{reportData.avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          {/* Inventory Metrics */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <BarChart3 size={18} className="text-orange-500" />
              Inventory Metrics
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Maida Stock:</span>
                <span className="font-semibold">{reportData.maidaStock} packets</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Oil Stock:</span>
                <span className="font-semibold">{reportData.oilStock} tins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ghee Stock:</span>
                <span className="font-semibold">{reportData.gheeStock} dabba</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;