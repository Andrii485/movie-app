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
      const res = await fetch(`http://localhost:5001/api/related-movies/${encodeURIComponent(selectedMovie)}`);
      if (!res.ok) throw new Error('No related movies');
      const data = await res.json();
      setRelated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Related films</h2>
      <div className="flex gap-3 mb-4">
        <select
          className="flex-1 border rounded p-2"
          value={selectedMovie}
          onChange={(e) => setSelectedMovie(e.target.value)}
        >
          <option value="">Select a movie</option>
          {movies.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <button
          onClick={fetchRelated}
          disabled={!selectedMovie || loading}
          className="bg-orange-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? '' : 'Show'}
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {related.length > 0 ? (
        <ul className="list-disc ml-5">
          {related.map((m, i) => (
            <li key={i}>{m.title} <span className="text-sm text-gray-600">({m.role})</span></li>
          ))}
        </ul>
      ) : (
        !loading && selectedMovie && <p className="text-gray-500">There are no related films.</p>
      )}
    </div>
  );
};

export default RelatedMovies;