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
      const res = await fetch(`http://localhost:5001/api/director-producer/${encodeURIComponent(selectedPerson)}`);
      if (!res.ok) throw new Error('Person not found');
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
      <h2 className="text-2xl font-bold mb-4">Films by the director/producer</h2>
      <div className="flex gap-3 mb-4">
        <select
          className="flex-1 border rounded p-2"
          value={selectedPerson}
          onChange={(e) => setSelectedPerson(e.target.value)}
        >
          <option value="">Select a person</option>
          {people.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button
          onClick={fetchMovies}
          disabled={!selectedPerson || loading}
          className="bg-purple-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? '' : 'Show'}
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {movies.length > 0 ? (
        <ul className="list-disc ml-5">
          {movies.map((m, i) => (
            <li key={i}>{m.title} <span className="text-sm text-gray-600">({m.role})</span></li>
          ))}
        </ul>
      ) : (
        !loading && selectedPerson && <p className="text-gray-500">No movies</p>
      )}
    </div>
  );
};

export default DirectorProducerSelector;