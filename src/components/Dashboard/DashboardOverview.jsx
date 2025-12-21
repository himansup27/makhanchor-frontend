// src/components/Dashboard/DashboardOverview.jsx
import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';
import StatsCard from './StatsCard';
import AlertBanner from './AlertBanner';
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

const DashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(true);
  
  // State for all data
  const [productionStats, setProductionStats] = useState(null);
  const [salesStats, setSalesStats] = useState(null);
  const [inventoryStats, setInventoryStats] = useState(null);
  const [productionData, setProductionData] = useState([]);
  const [salesData, setSalesData] = useState([]);

  // Load all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all stats in parallel
      const [prodStats, saleStats, invStats, prodData, saleData] = await Promise.all([
        productionAPI.getStats(),
        salesAPI.getStats(),
        inventoryAPI.getAllStats(),
        productionAPI.getAll({ limit: 30 }),
        salesAPI.getAll({ limit: 30 }),
      ]);

      if (prodStats.success) setProductionStats(prodStats.data);
      if (saleStats.success) setSalesStats(saleStats.data);
      if (invStats.success) setInventoryStats(invStats.data);
      if (prodData.success) setProductionData(prodData.data);
      if (saleData.success) setSalesData(saleData.data);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalProduction = productionStats?.totalProduction || 0;
  const totalSales = salesStats?.totalSales || 0;
  const totalRevenue = salesStats?.totalRevenue || 0;
  const availableStock = productionStats?.totalRemaining || 0;
  const profitMargin = totalRevenue > 0 ? ((totalRevenue - (productionStats?.totalAmount || 0)) / totalRevenue * 100).toFixed(1) : 0;

  // Get today's production
  const today = new Date().toISOString().split('T')[0];
  const todayProduction = productionData.find(p => p.date.split('T')[0] === today);

  // Prepare chart data - combine production and sales by date
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const prod = productionData.find(p => p.date.split('T')[0] === date);
    const sale = salesData.find(s => s.date.split('T')[0] === date);
    
    return {
      date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      production: prod?.packets || 0,
      sales: sale?.packets || 0,
      revenue: sale?.amount || 0,
    };
  });

  // Inventory distribution data
  const inventoryData = [
    { 
      name: 'Maida', 
      value: inventoryStats?.maida?.currentStock || 0, 
      color: '#f59e0b',
      cost: inventoryStats?.maida?.totalCost || 0
    },
    { 
      name: 'Oil', 
      value: inventoryStats?.oil?.currentStock || 0, 
      color: '#eab308',
      cost: inventoryStats?.oil?.totalCost || 0
    },
    { 
      name: 'Ghee', 
      value: inventoryStats?.ghee?.currentStock || 0, 
      color: '#f97316',
      cost: inventoryStats?.ghee?.totalCost || 0
    },
  ];

  // Recent activity
  const recentActivity = [
    ...productionData.slice(0, 2).map(p => ({
      type: 'production',
      message: `New production entry: ${p.packets} packets`,
      time: getTimeAgo(p.createdAt),
      color: 'bg-blue-100 text-blue-600'
    })),
    ...salesData.slice(0, 2).map(s => ({
      type: 'sales',
      message: `Sales updated: ${s.packets} packets sold${s.customer ? ` to ${s.customer}` : ''}`,
      time: getTimeAgo(s.createdAt),
      color: 'bg-green-100 text-green-600'
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 4);

  // Low stock alerts
  const lowStockAlerts = [];
  if (inventoryStats?.maida?.currentStock < 20) {
    lowStockAlerts.push(`Maida stock is low (${inventoryStats.maida.currentStock} packets remaining)`);
  }
  if (inventoryStats?.oil?.currentStock < 10) {
    lowStockAlerts.push(`Oil stock is low (${inventoryStats.oil.currentStock} tins remaining)`);
  }
  if (inventoryStats?.ghee?.currentStock < 5) {
    lowStockAlerts.push(`Ghee stock is critically low (${inventoryStats.ghee.currentStock} dabba remaining)`);
  }

  // Helper function for time ago
  function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-600 mt-1">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAllData}
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {showAlert && lowStockAlerts.length > 0 && (
        <AlertBanner
          type="warning"
          title="Inventory Alerts"
          messages={lowStockAlerts}
          onClose={() => setShowAlert(false)}
          action={() => window.location.href = '/inventory/maida'}
          actionLabel="View Inventory"
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Today's Production"
          value={todayProduction?.packets || 0}
          subtitle="packets produced"
          icon={Package}
          trend="up"
          trendValue={`${productionStats?.avgDailyProduction?.toFixed(0) || 0} avg/day`}
          color="blue"
        />
        <StatsCard
          title="Available Stock"
          value={availableStock}
          subtitle="packets in inventory"
          icon={TrendingUp}
          trend={availableStock > 100 ? 'up' : 'down'}
          trendValue={availableStock > 100 ? 'Healthy stock' : 'Low stock'}
          color="green"
        />
        <StatsCard
          title="Total Sales"
          value={totalSales}
          subtitle="packets sold"
          icon={ShoppingCart}
          trend="up"
          trendValue={`${salesStats?.avgSalePackets?.toFixed(0) || 0} avg/sale`}
          color="purple"
        />
        <StatsCard
          title="Revenue"
          value={`₹${(totalRevenue / 1000).toFixed(0)}K`}
          subtitle="total earnings"
          icon={DollarSign}
          trend="up"
          trendValue={`${profitMargin}% margin`}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production vs Sales Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Production vs Sales</h3>
              <p className="text-sm text-gray-600">Last 7 days performance</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-medium bg-primary-50 text-primary-600 rounded-lg">
                Week
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
                Month
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
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
              <XAxis
                dataKey="date"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
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

        {/* Inventory Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Inventory Status</h3>
          <p className="text-sm text-gray-600 mb-6">Current stock distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={inventoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {inventoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-3">
            {inventoryData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 text-sm">{item.value} units</div>
                  <div className="text-xs text-gray-500">
                    ₹{(item.cost / 1000).toFixed(0)}K
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className={`${activity.color} p-2 rounded-lg`}>
                    {activity.type === 'production' ? (
                      <Package size={20} />
                    ) : (
                      <ShoppingCart size={20} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium mb-1">Total Production</p>
              <p className="text-2xl font-bold text-blue-900">{totalProduction}</p>
              <p className="text-xs text-blue-600 mt-1">packets all time</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-900">
                ₹{(totalRevenue / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-green-600 mt-1">all time earnings</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-sm text-amber-600 font-medium mb-1">Inventory Value</p>
              <p className="text-2xl font-bold text-amber-900">
                ₹{((inventoryStats?.maida?.totalCost || 0) + (inventoryStats?.oil?.totalCost || 0) + (inventoryStats?.ghee?.totalCost || 0)) / 1000}K
              </p>
              <p className="text-xs text-amber-600 mt-1">total stock value</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;