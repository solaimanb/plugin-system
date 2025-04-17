// plugins/hello.tsx
import React from 'react';

// Components
export const HeaderDesignA = () => (
  <header className="bg-blue-600 text-white p-4 shadow-md">
    <div className="container mx-auto flex justify-between items-center">
      <h1 className="text-2xl font-bold">My Awesome Site</h1>
      <nav>
        <ul className="flex space-x-6">
          <li><a href="/" className="hover:underline">Home</a></li>
          <li><a href="/coming-soon" className="hover:underline">Coming Soon</a></li>
          <li><a href="/admin/dashboard" className="hover:underline">Admin</a></li>
        </ul>
      </nav>
    </div>
  </header>
);

export const FooterDesign = () => (
  <footer className="bg-gray-800 text-white p-6 mt-8">
    <div className="container mx-auto text-center">
      <p>&copy; {new Date().getFullYear()} My Company. All rights reserved.</p>
    </div>
  </footer>
);

export const ComingSoonPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center p-8 bg-white rounded-lg shadow-xl">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Coming Soon!</h1>
      <p className="text-xl text-gray-600">
        We're working on something amazing. Stay tuned!
      </p>
    </div>
  </div>
);

export const AdminDashboard = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <div key={item} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Section {item}</h3>
            <p className="text-gray-600">
              This is a sample admin dashboard component.
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Hook registrations
export const actions = [
  { hookName: 'Nex-header', position: 1, componentName: 'HeaderDesignA' },
  { hookName: 'Nex-footer', position: 1, componentName: 'FooterDesign' }
];

// Route registrations
export const routes = [
  { 
    type: 'view', 
    route: '/coming-soon',
    componentName: 'ComingSoonPage',
    position: 1
  },
  { 
    type: 'admin', 
    route: '/dashboard',
    componentName: 'AdminDashboard',
    position: 1
  }
];