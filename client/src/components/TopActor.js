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
      const res = await fetch('http://localhost:5000/api/top-actor');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setTopActor(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-yellow-900 to-amber-900 p-6 rounded-2xl shadow-2xl text-white transform transition-all hover:scale-[1.01]">
      <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
        <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        Top actor
      </h2>

      <button
        onClick={fetchTopActor}
        disabled={loading}
        className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 py-3 rounded-lg font-medium hover:from-amber-700 hover:to-yellow-700 disabled:opacity-50 transition shadow-lg"
      >
        {loading ? '' : 'Find the most popular'}
      </button>

      {error && <div className="bg-red-900 bg-opacity-80 text-red-200 p-4 rounded-lg mt-4">{error}</div>}

      {topActor && topActor.name !== 'No actors' && (
        <div className="mt-5 p-5 bg-white bg-opacity-10 backdrop-blur-lg rounded-xl border border-yellow-400 text-center">
          
          <p className="text-2xl font-bold text-yellow-300">{topActor.name}</p>
          <p className="text-lg text-amber-200 mt-2">{topActor.movieCount} films</p>
        </div>
      )}
    </div>
  );
};

export default TopActor;