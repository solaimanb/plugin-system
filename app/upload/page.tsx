'use client';

import React, { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a .tsx file first.');
      return;
    }

    if (!file.name.endsWith('.tsx')) {
      setMessage('Only .tsx files are allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      setMessage('File uploaded successfully!');
    } else {
      const error = await res.text();
      setMessage(`Upload failed: ${error}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Upload .tsx Plugin File</h1>
      <input
        type="file"
        accept=".tsx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Upload
      </button>
      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
