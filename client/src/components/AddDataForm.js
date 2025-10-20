import React, { useState } from 'react';

const AddDataForm = () => {
  const [movieTitle, setMovieTitle] = useState('');
  const [movieYear, setMovieYear] = useState('');
  const [movieTagline, setMovieTagline] = useState('');
  const [personName, setPersonName] = useState('');
  const [personRole, setPersonRole] = useState('ACTED_IN');
  const [message, setMessage] = useState('');

  const addData = async () => {
    if (!movieTitle || !movieYear) {
      setMessage('Please fill in movie title and year.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5001/api/add-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieTitle,
          movieYear,
          movieTagline,
          personName,
          personRole
        })
      });
      const data = await response.json();
      setMessage(data.message || 'Error adding data.');
    } catch (error) {
      console.error('Error adding data:', error);
      setMessage('Error adding data.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Add Movie/Person</h2>
      <div className="mb-4">
        <label className="block">Movie Title</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={movieTitle}
          onChange={(e) => setMovieTitle(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block">Released Year</label>
        <input
          type="number"
          className="border p-2 w-full"
          value={movieYear}
          onChange={(e) => setMovieYear(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block">Tagline (Optional)</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={movieTagline}
          onChange={(e) => setMovieTagline(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block">Person Name (Optional)</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block">Role</label>
        <select
          className="border p-2 w-full"
          value={personRole}
          onChange={(e) => setPersonRole(e.target.value)}
        >
          <option value="ACTED_IN">Actor</option>
          <option value="DIRECTED">Director</option>
          <option value="PRODUCED">Producer</option>
          <option value="WROTE">Writer</option>
        </select>
      </div>
      <button
        className="bg-blue-500 text-white p-2 rounded"
        onClick={addData}
      >
        Add Data
      </button>
      {message && <p className="mt-4 text-green-500">{message}</p>}
    </div>
  );
};

export default AddDataForm;