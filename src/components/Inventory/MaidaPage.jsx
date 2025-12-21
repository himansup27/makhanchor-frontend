// src/components/Inventory/MaidaPage.jsx
import React from 'react';
import { Wheat } from 'lucide-react';
import InventoryPage from './InventoryPage';

const MaidaPage = () => {
  const config = {
    name: 'Maida',
    icon: Wheat,
    color: 'text-amber-500',
    colorName: 'orange',
    unit: 'packets',
    unitSize: '50kg',
    lowStockThreshold: 20,
  };

  return <InventoryPage type="maida" config={config} />;
};

export default MaidaPage;