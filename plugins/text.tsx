//plugins/text.tsx

import React from 'react';

// কম্পোনেন্ট ১: হেডার ডিজাইন এ
export const hello = () => (
  <div className="bg-blue-100 text-white p-4">
    <h1 className="text-2xl font-bold">HeLLo</h1>
  </div>
);
// একশন কনফিগারেশন
export const actions = [
  { hookName: 'Nex-header', position: 0, componentName: 'hello' },
];

// Route registrations
export const routes = [
  {
    type: 'admin',
    route: '/blog',
    componentName: 'hello',
    position: 1
  }
];