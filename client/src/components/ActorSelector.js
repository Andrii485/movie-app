import React, { useState } from 'react';

const ActorSelector = ({ people = [] }) => {
  const [selectedActor, setSelectedActor] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMovies = async () => {
    if (!selectedActor) return;
    setLoading(true);
    setError('');
    setMovies([]);

    try {
      const res = await fetch(`http://localhost:5000/api/actor/${encodeURIComponent(selectedActor)}`);
      if (!res.ok) throw new Error('Actor not found');
      const data = await res.json();
      setMovies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-900 to-teal-900 p-6 rounded-2xl shadow-2xl text-white transform transition-all hover:scale-[1.01]">
      <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
        <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
       The actor's films
      </h2>

      <div className="flex gap-3 mb-5">
        <select
          className="flex-1 bg-white bg-opacity-20 backdrop-blur-md border border-green-400 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          value={selectedActor}
          onChange={(e) => setSelectedActor(e.target.value)}
        >
          <option value="" className="text-gray-700">Select an actor</option>
          {people.map(p => <option key={p} value={p} className="text-gray-900">{p}</option>)}
        </select>
        <button
          onClick={fetchMovies}
          disabled={!selectedActor || loading}
          className="bg-gradient-to-r from-teal-600 to-green-600 px-6 py-3 rounded-lg font-medium hover:from-teal-700 hover:to-green-700 disabled:opacity-50 transition shadow-lg"
        >
          {loading ? '' : 'Show'}
        </button>
      </div>

      {error && <div className="bg-red-900 bg-opacity-80 text-red-200 p-4 rounded-lg mb-4">{error}</div>}

      {movies.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {movies.map((m, i) => (
            <div key={i} className="bg-white bg-opacity-10 p-3 rounded-lg hover:bg-opacity-20 transition flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              <span>{m}</span>
            </div>
          ))}
        </div>
      ) : (
        !loading && selectedActor && <p className="text-green-300 italic">No movies</p>
      )}
    </div>
  );
};

export default ActorSelector;