//plugins/text.tsx

import React from 'react';

// কম্পোনেন্ট ১: হেডার ডিজাইন এ
export const Hello = () => (
  <div className="bg-blue-100 text-white p-4">
    <h1 className="text-2xl font-bold">HeLLo</h1>
  </div>
);

// একশন কনফিগারেশন
export const actions = [
  { hookName: 'Nex-header', position: 0, componentName: 'Hello' },
];

// Route registrations
export const routes = [
  {
    type: 'admin',
    route: '/blog',
    componentName: 'Hello',
    position: 1
  }
];