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
      const res = await fetch(`http://localhost:5000/api/movie/${encodeURIComponent(selectedMovie)}`);
      if (!res.ok) throw new Error('Film not found');
      const data = await res.json();
      setMovieDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 to-pink-900 p-6 rounded-2xl shadow-2xl text-white transform transition-all hover:scale-[1.01]">
      <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
        <svg className="w-7 h-7 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
        </svg>
        Details about the film
      </h2>

      <div className="flex gap-3 mb-5">
        <select
          className="flex-1 bg-white bg-opacity-20 backdrop-blur-md border border-purple-400 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
          value={selectedMovie}
          onChange={(e) => setSelectedMovie(e.target.value)}
        >
          <option value="" className="text-gray-700">Select a movie</option>
          {movies.map(m => (
            <option key={m} value={m} className="text-gray-900">{m}</option>
          ))}
        </select>
        <button
          onClick={fetchMovieDetails}
          disabled={!selectedMovie || loading}
          className="bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 rounded-lg font-medium hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
        >
          {loading ? '' : 'Show'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900 bg-opacity-80 border border-red-500 text-red-200 p-4 rounded-lg mb-4 animate-pulse">
          {error}
        </div>
      )}

      {movieDetails && (
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-purple-400">
          <h3 className="text-2xl font-bold text-pink-300 mb-3">{movieDetails.title}</h3>
          <div className="space-y-2 mb-5">
            <p><strong className="text-purple-300">Year:</strong> <span className="text-pink-200">{movieDetails.released}</span></p>
            {movieDetails.tagline && (
              <p><strong className="text-purple-300">Slogan:</strong> <span className="italic text-pink-200">"{movieDetails.tagline}"</span></p>
            )}
          </div>

          <h4 className="font-semibold text-lg text-purple-300 mb-3">Participants:</h4>
          {movieDetails.people?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {movieDetails.people.map((p, i) => (
                <div key={i} className="bg-white bg-opacity-10 p-3 rounded-lg flex justify-between items-center hover:bg-opacity-20 transition">
                  <span className="font-medium truncate">{p.person}</span>
                  <span className="text-xs bg-purple-600 px-2 py-1 rounded-full">{p.role}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-purple-300 italic">No data</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MovieSelector;