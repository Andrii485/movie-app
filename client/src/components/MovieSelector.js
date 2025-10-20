import React, { useState } from 'react';

const MovieSelector = ({ movies }) => {
  const [selectedMovie, setSelectedMovie] = useState('');
  const [movieDetails, setMovieDetails] = useState(null);

  const fetchMovieDetails = async () => {
    if (!selectedMovie) return;
    try {
      const response = await fetch(`http://localhost:5001/api/movie/${encodeURIComponent(selectedMovie)}`);
      const data = await response.json();
      setMovieDetails(data);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Select a Movie</h2>
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
        onClick={fetchMovieDetails}
      >
        Show Details
      </button>
      {movieDetails && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">{movieDetails.title}</h3>
          <p><strong>Released:</strong> {movieDetails.released}</p>
          {movieDetails.tagline && <p><strong>Tagline:</strong> {movieDetails.tagline}</p>}
          <h4 className="font-semibold mt-2">People:</h4>
          <ul>
            {movieDetails.people.map((p, i) => (
              <li key={i}>{p.person} ({p.role})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MovieSelector;