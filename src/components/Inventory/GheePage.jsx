// src/components/Inventory/GheePage.jsx
import React from 'react';
import { Cookie } from 'lucide-react';
import InventoryPage from './InventoryPage';

const GheePage = () => {
  const config = {
    name: 'Ghee',
    icon: Cookie,
    color: 'text-orange-500',
    colorName: 'orange',
    unit: 'dabba',
    unitSize: '25kg',
    lowStockThreshold: 5,
  };

  return <InventoryPage type="ghee" config={config} />;
};

export default GheePage;