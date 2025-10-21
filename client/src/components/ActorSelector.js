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
      const res = await fetch(`http://localhost:5001/api/actor/${encodeURIComponent(selectedActor)}`);
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
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">The actor's films</h2>
      <div className="flex gap-3 mb-4">
        <select
          className="flex-1 border rounded p-2"
          value={selectedActor}
          onChange={(e) => setSelectedActor(e.target.value)}
        >
          <option value="">Select an actor</option>
          {people.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button
          onClick={fetchMovies}
          disabled={!selectedActor || loading}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? '' : 'Show'}
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {movies.length > 0 ? (
        <ul className="list-disc ml-5">
          {movies.map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      ) : (
        !loading && selectedActor && <p className="text-gray-500">No movies</p>
      )}
    </div>
  );
};

export default ActorSelector;