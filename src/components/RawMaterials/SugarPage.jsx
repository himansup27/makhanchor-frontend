// src/components/RawMaterials/SugarPage.jsx
import React from 'react';
import { Candy } from 'lucide-react';
import RawMaterialsPage from './RawMaterialsPage';

const SugarPage = () => {
  const config = {
    name: 'Sugar',
    icon: Candy,
    color: 'text-pink-500',
    colorName: 'pink',
    unit: 'packets',
  };

  return <RawMaterialsPage type="sugar" config={config} />;
};

export default SugarPage;