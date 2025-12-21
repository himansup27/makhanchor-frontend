// src/components/Inventory/OilPage.jsx
import React from 'react';
import { Droplet } from 'lucide-react';
import InventoryPage from './InventoryPage';

const OilPage = () => {
  const config = {
    name: 'Oil',
    icon: Droplet,
    color: 'text-yellow-500',
    colorName: 'orange',
    unit: 'tins',
    unitSize: '25 liter',
    lowStockThreshold: 10,
  };

  return <InventoryPage type="oil" config={config} />;
};

export default OilPage;