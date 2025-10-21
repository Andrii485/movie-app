import React, { useState } from 'react';

const MovieSelector = ({ movies = [] }) => {
  const [selectedMovie, setSelectedMovie] = useState('');
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMovieDetails = async () => {
    if (!selectedMovie) return;

    setLoading(true);
    setError('');
    setMovieDetails(null);

    try {
      const encodedTitle = encodeURIComponent(selectedMovie);
      const response = await fetch(`http://localhost:5001/api/movie/${encodedTitle}`);

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setMovieDetails(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Не удалось загрузить фильм');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Подробности о фильме</h2>

      <div className="flex gap-3 mb-4">
        <select
          className="flex-1 border rounded p-2"
          value={selectedMovie}
          onChange={(e) => setSelectedMovie(e.target.value)}
          disabled={loading}
        >
          <option value="">Выберите фильм</option>
          {movies.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <button
          onClick={fetchMovieDetails}
          disabled={!selectedMovie || loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400 hover:bg-blue-700"
        >
          {loading ? 'Загрузка...' : 'Показать'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {movieDetails && (
        <div className="border rounded p-4 bg-gray-50">
          <h3 className="text-xl font-bold">{movieDetails.title}</h3>
          <p><strong>Год:</strong> {movieDetails.released || 'Не указан'}</p>
          {movieDetails.tagline && <p><strong>Слоган:</strong> {movieDetails.tagline}</p>}

          <h4 className="font-semibold mt-3">Участники:</h4>
          {movieDetails.people && movieDetails.people.length > 0 ? (
            <ul className="list-disc ml-5 mt-2">
              {movieDetails.people.map((p, i) => (
                <li key={i}>
                  {p.person} <span className="text-sm text-gray-600">({p.role})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">Нет данных об участниках</p>
          )}
        </div>
      )}

      {!movieDetails && !loading && !error && selectedMovie && (
        <p className="text-gray-500">Нажмите "Показать", чтобы загрузить данные</p>
      )}
    </div>
  );
};

export default MovieSelector;