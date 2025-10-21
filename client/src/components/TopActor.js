import React, { useState } from 'react';

const TopActor = () => {
  const [topActor, setTopActor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTopActor = async () => {
    setLoading(true);
    setError('');
    setTopActor(null);

    try {
      const res = await fetch('http://localhost:5001/api/top-actor');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTopActor(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">The most popular actor</h2>
      <button
        onClick={fetchTopActor}
        disabled={loading}
        className="bg-teal-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {loading ? 'Загрузка...' : 'Find'}
      </button>

      {error && <p className="text-red-600 mt-3">{error}</p>}

      {topActor && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p><strong>Name:</strong> {topActor.name}</p>
          <p><strong>Movies:</strong> {topActor.movieCount}</p>
        </div>
      )}
    </div>
  );
};

export default TopActor;