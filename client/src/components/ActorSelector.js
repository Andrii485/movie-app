import React, { useState } from 'react';

const ActorSelector = ({ people }) => {
  const [selectedActor, setSelectedActor] = useState('');
  const [actorMovies, setActorMovies] = useState([]);

  const fetchActorMovies = async () => {
    if (!selectedActor) return;
    try {
      const response = await fetch(`http://localhost:5001/api/actor/${encodeURIComponent(selectedActor)}`);
      const data = await response.json();
      setActorMovies(data);
    } catch (error) {
      console.error('Error fetching actor movies:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Select an Actor</h2>
      <select
        className="border p-2 mb-4 w-full"
        value={selectedActor}
        onChange={(e) => setSelectedActor(e.target.value)}
      >
        <option value="">Select an actor</option>
        {people.map(person => (
          <option key={person} value={person}>{person}</option>
        ))}
      </select>
      <button
        className="bg-blue-500 text-white p-2 rounded"
        onClick={fetchActorMovies}
      >
        Show Movies
      </button>
      {actorMovies.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Movies with {selectedActor}</h3>
          <ul>
            {actorMovies.map(movie => (
              <li key={movie}>{movie}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ActorSelector;