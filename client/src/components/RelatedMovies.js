import React, { useState } from 'react';

const RelatedMovies = ({ movies = [] }) => {
  const [selectedMovie, setSelectedMovie] = useState('');
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRelated = async () => {
    if (!selectedMovie) return;
    setLoading(true);
    setError('');
    setRelated([]);

    try {
      const res = await fetch(`http://localhost:5000/api/related-movies/${encodeURIComponent(selectedMovie)}`);
      if (!res.ok) throw new Error('There are no related films.');
      const data = await res.json();
      setRelated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-900 to-red-900 p-6 rounded-2xl shadow-2xl text-white transform transition-all hover:scale-[1.01]">
      <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
        <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Related films
      </h2>

      <div className="flex gap-3 mb-5">
        <select
          className="flex-1 bg-white bg-opacity-20 backdrop-blur-md border border-orange-400 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          value={selectedMovie}
          onChange={(e) => setSelectedMovie(e.target.value)}
        >
          <option value="" className="text-gray-700">Select a movie</option>
          {movies.map(m => <option key={m} value={m} className="text-gray-900">{m}</option>)}
        </select>
        <button
          onClick={fetchRelated}
          disabled={!selectedMovie || loading}
          className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-3 rounded-lg font-medium hover:from-red-700 hover:to-orange-700 disabled:opacity-50 transition shadow-lg"
        >
          {loading ? '' : 'Show'}
        </button>
      </div>

      {error && <div className="bg-red-900 bg-opacity-80 text-red-200 p-4 rounded-lg mb-4">{error}</div>}

      {related.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {related.map((m, i) => (
            <div key={i} className="bg-white bg-opacity-10 p-3 rounded-lg flex justify-between items-center hover:bg-opacity-20 transition">
              <span className="font-medium">{m.title}</span>
              <span className="text-xs bg-red-600 px-2 py-1 rounded-full">{m.role}</span>
            </div>
          ))}
        </div>
      ) : (
        !loading && selectedMovie && <p className="text-orange-300 italic">There are no related films.</p>
      )}
    </div>
  );
};

export default RelatedMovies;