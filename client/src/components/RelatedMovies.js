import React, { useState } from 'react';

const RelatedMovies = ({ movies }) => {
  const [selectedMovie, setSelectedMovie] = useState('');
  const [relatedMovies, setRelatedMovies] = useState([]);

  const fetchRelatedMovies = async () => {
    if (!selectedMovie) return;
    try {
      const response = await fetch(`http://localhost:5001/api/related-movies/${encodeURIComponent(selectedMovie)}`);
      const data = await response.json();
      setRelatedMovies(data);
    } catch (error) {
      console.error('Error fetching related movies:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Select a Movie for Related Movies</h2>
      <select
        className="border p-2 mb-4 w-full"
        value={selectedMovie}
        onChange={(e) => setSelectedMovie(e.target.value)}
      >
        <option value="">Select a movie</option>
        {movies.map(movie => (
          <option key={movie} value={movie}>{movie}</option>
        ))}
      </select>
      <button
        className="bg-blue-500 text-white p-2 rounded"
        onClick={fetchRelatedMovies}
      >
        Show Related Movies
      </button>
      {relatedMovies.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Related Movies</h3>
          <ul>
            {relatedMovies.map((movie, i) => (
              <li key={i}>{movie.title} ({movie.role})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RelatedMovies;