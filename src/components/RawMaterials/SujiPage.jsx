// src/components/RawMaterials/SujiPage.jsx
import React from 'react';
import { Wheat } from 'lucide-react';
import RawMaterialsPage from './RawMaterialsPage';

const SujiPage = () => {
  const config = {
    name: 'Suji',
    icon: Wheat,
    color: 'text-yellow-600',
    colorName: 'yellow',
    unit: 'packets',
  };

  return <RawMaterialsPage type="suji" config={config} />;
};

export default SujiPage;