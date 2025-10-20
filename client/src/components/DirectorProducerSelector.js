import React, { useState } from 'react';

const DirectorProducerSelector = ({ people }) => {
  const [selectedPerson, setSelectedPerson] = useState('');
  const [personMovies, setPersonMovies] = useState([]);

  const fetchPersonMovies = async () => {
    if (!selectedPerson) return;
    try {
      const response = await fetch(`http://localhost:5001/api/director-producer/${encodeURIComponent(selectedPerson)}`);
      const data = await response.json();
      setPersonMovies(data);
    } catch (error) {
      console.error('Error fetching director/producer movies:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Select a Director/Producer</h2>
      <select
        className="border p-2 mb-4 w-full"
        value={selectedPerson}
        onChange={(e) => setSelectedPerson(e.target.value)}
      >
        <option value="">Select a person</option>
        {people.map(person => (
          <option key={person} value={person}>{person}</option>
        ))}
      </select>
      <button
        className="bg-blue-500 text-white p-2 rounded"
        onClick={fetchPersonMovies}
      >
        Show Movies
      </button>
      {personMovies.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Movies by {selectedPerson}</h3>
          <ul>
            {personMovies.map((movie, i) => (
              <li key={i}>{movie.title} ({movie.role})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DirectorProducerSelector;