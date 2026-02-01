// src/components/RawMaterials/SaltPage.jsx
import React from 'react';
import { Package } from 'lucide-react';
import RawMaterialsPage from './RawMaterialsPage';

const SaltPage = () => {
  const config = {
    name: 'Salt',
    icon: Package,
    color: 'text-gray-600',
    colorName: 'gray',
    unit: 'packets',
  };

  return <RawMaterialsPage type="salt" config={config} />;
};

export default SaltPage;