import React, { useState } from 'react';

const TopActor = () => {
  const [topActor, setTopActor] = useState(null);

  const fetchTopActor = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/top-actor');
      const data = await response.json();
      setTopActor(data);
    } catch (error) {
      console.error('Error fetching top actor:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Top Actor</h2>
      <button
        className="bg-blue-500 text-white p-2 rounded"
        onClick={fetchTopActor}
      >
        Find Top Actor
      </button>
      {topActor && (
        <div className="mt-4">
          <p><strong>Name:</strong> {topActor.name}</p>
          <p><strong>Number of Movies:</strong> {topActor.movieCount}</p>
        </div>
      )}
    </div>
  );
};

export default TopActor;