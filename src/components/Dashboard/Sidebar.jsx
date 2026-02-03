// src/components/Dashboard/Sidebar.jsx
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Wheat,
  Droplet,
  Cookie,
  ShoppingCart,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Flame,
  Candy,
  Receipt,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(true);
  const [rawMaterialsOpen, setRawMaterialsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'production',
      label: 'Production',
      icon: Package,
      path: '/production',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  const inventoryItems = [
    {
      id: 'maida',
      label: 'Maida',
      icon: Wheat,
      path: '/inventory/maida',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      id: 'oil',
      label: 'Oil',
      icon: Droplet,
      path: '/inventory/oil',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      id: 'ghee',
      label: 'Ghee',
      icon: Cookie,
      path: '/inventory/ghee',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
  ];

  const rawMaterialsItems = [
    {
      id: 'suji',
      label: 'Suji',
      icon: Wheat,
      path: '/raw-materials/suji',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      id: 'sugar',
      label: 'Sugar',
      icon: Candy,
      path: '/raw-materials/sugar',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
    },
    {
      id: 'salt',
      label: 'Salt',
      icon: Package,
      path: '/raw-materials/salt',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      id: 'gas',
      label: 'Gas',
      icon: Flame,
      path: '/raw-materials/gas',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
  ];

  const bottomMenuItems = [
    {
      id: 'miscellaneous',
      label: 'Miscellaneous',
      icon: Receipt,
      path: '/miscellaneous',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: ShoppingCart,
      path: '/sales',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      path: '/reports',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
    },
  ];

  const isActive = (path) => location.pathname === path;
  const isInventoryActive = inventoryItems.some(item => isActive(item.path));
  const isRawMaterialsActive = rawMaterialsItems.some(item => isActive(item.path));

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-white border-r border-gray-200 h-screen sticky top-0 transition-all duration-300 flex flex-col`}
    >
      {/* Collapse Button */}
      <div className="p-4 flex justify-end">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRight size={20} className="text-gray-600" />
          ) : (
            <ChevronLeft size={20} className="text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto">
        <div className="space-y-1">
          {/* Main Menu Items */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                  active
                    ? `${item.bgColor} ${item.color} shadow-sm`
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-current rounded-r-full"></div>
                )}

                <Icon
                  size={20}
                  className={`flex-shrink-0 ${active ? '' : 'group-hover:scale-110'} transition-transform`}
                />
                
                {!collapsed && (
                  <span className={`font-medium text-sm ${active ? 'font-semibold' : ''}`}>
                    {item.label}
                  </span>
                )}

                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}

          {/* Inventory Section */}
          <div className="pt-2">
            <button
              onClick={() => !collapsed && setInventoryOpen(!inventoryOpen)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isInventoryActive && !collapsed
                  ? 'bg-gray-50 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package size={20} className="flex-shrink-0" />
              
              {!collapsed && (
                <>
                  <span className="font-medium text-sm flex-1 text-left">Inventory</span>
                  {inventoryOpen ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </>
              )}

              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  Inventory
                </div>
              )}
            </button>

            {!collapsed && inventoryOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {inventoryItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                        active
                          ? `${item.bgColor} ${item.color} shadow-sm`
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-current rounded-r-full"></div>
                      )}

                      <Icon size={18} className="flex-shrink-0" />
                      <span className={`text-sm ${active ? 'font-semibold' : ''}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Raw Materials Section */}
          <div className="pt-2">
            <button
              onClick={() => !collapsed && setRawMaterialsOpen(!rawMaterialsOpen)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isRawMaterialsActive && !collapsed
                  ? 'bg-gray-50 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package size={20} className="flex-shrink-0" />
              
              {!collapsed && (
                <>
                  <span className="font-medium text-sm flex-1 text-left">Raw Materials</span>
                  {rawMaterialsOpen ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </>
              )}

              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  Raw Materials
                </div>
              )}
            </button>

            {!collapsed && rawMaterialsOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {rawMaterialsItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                        active
                          ? `${item.bgColor} ${item.color} shadow-sm`
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-current rounded-r-full"></div>
                      )}

                      <Icon size={18} className="flex-shrink-0" />
                      <span className={`text-sm ${active ? 'font-semibold' : ''}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Menu Items */}
          <div className="pt-2 mt-2 border-t border-gray-200">
            {bottomMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                    active
                      ? `${item.bgColor} ${item.color} shadow-sm`
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-current rounded-r-full"></div>
                  )}

                  <Icon
                    size={20}
                    className={`flex-shrink-0 ${active ? '' : 'group-hover:scale-110'} transition-transform`}
                  />
                  
                  {!collapsed && (
                    <span className={`font-medium text-sm ${active ? 'font-semibold' : ''}`}>
                      {item.label}
                    </span>
                  )}

                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings at bottom */}
        <div className="pt-2 mt-2 border-t border-gray-200">
          <button
            onClick={() => navigate('/settings')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
              isActive('/settings')
                ? 'bg-gray-100 text-gray-900 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Settings size={20} className="flex-shrink-0" />
            {!collapsed && <span className="font-medium text-sm">Settings</span>}
            
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                Settings
              </div>
            )}
          </button>
        </div>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-900 mb-1">Need Help?</p>
            <p className="text-xs text-gray-600 mb-2">Contact support for assistance</p>
            <button className="text-xs font-medium text-primary-600 hover:text-primary-700">
              Get Support →
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;