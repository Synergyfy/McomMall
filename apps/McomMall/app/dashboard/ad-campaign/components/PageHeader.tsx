import React from 'react';

interface PageHeaderProps {
  title: string;
  breadcrumb: string;
}

export const PageHeader = ({ title, breadcrumb }: PageHeaderProps) => {
  return (
    <header className="mb-8">
      <p className="text-sm text-gray-500">{breadcrumb}</p>
      <h1 className="text-3xl font-bold text-gray-900 mt-1">{title}</h1>
    </header>
  );
};
