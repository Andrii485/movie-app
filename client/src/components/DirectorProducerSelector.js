import React, { useState } from 'react';

const DirectorProducerSelector = ({ people = [] }) => {
  const [selectedPerson, setSelectedPerson] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMovies = async () => {
    if (!selectedPerson) return;
    setLoading(true);
    setError('');
    setMovies([]);

    try {
      const res = await fetch(`http://localhost:5000/api/director-producer/${encodeURIComponent(selectedPerson)}`);
      if (!res.ok) throw new Error('The person was not found');
      const data = await res.json();
      setMovies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-2xl shadow-2xl text-white transform transition-all hover:scale-[1.01]">
      <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
        <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        Directors / Producers
      </h2>

      <div className="flex gap-3 mb-5">
        <select
          className="flex-1 bg-white bg-opacity-20 backdrop-blur-md border border-indigo-400 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={selectedPerson}
          onChange={(e) => setSelectedPerson(e.target.value)}
        >
          <option value="" className="text-gray-700">Select a person</option>
          {people.map(p => <option key={p} value={p} className="text-gray-900">{p}</option>)}
        </select>
        <button
          onClick={fetchMovies}
          disabled={!selectedPerson || loading}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition shadow-lg"
        >
          {loading ? '' : 'Show'}
        </button>
      </div>

      {error && <div className="bg-red-900 bg-opacity-80 text-red-200 p-4 rounded-lg mb-4">{error}</div>}

      {movies.length > 0 ? (
        <div className="space-y-2">
          {movies.map((m, i) => (
            <div key={i} className="bg-white bg-opacity-10 p-3 rounded-lg flex justify-between items-center hover:bg-opacity-20 transition">
              <span className="font-medium">{m.title}</span>
              <span className="text-xs bg-indigo-600 px-2 py-1 rounded-full">{m.role}</span>
            </div>
          ))}
        </div>
      ) : (
        !loading && selectedPerson && <p className="text-indigo-300 italic">No movies</p>
      )}
    </div>
  );
};

export default DirectorProducerSelector;