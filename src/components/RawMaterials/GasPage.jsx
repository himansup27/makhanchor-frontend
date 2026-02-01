// src/components/RawMaterials/GasPage.jsx
import React from 'react';
import { Flame } from 'lucide-react';
import RawMaterialsPage from './RawMaterialsPage';

const GasPage = () => {
  const config = {
    name: 'Gas',
    icon: Flame,
    color: 'text-red-500',
    colorName: 'red',
    unit: 'tanks',
  };

  return <RawMaterialsPage type="gas" config={config} />;
};

export default GasPage;