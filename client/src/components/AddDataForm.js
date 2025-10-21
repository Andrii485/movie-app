import React, { useState } from 'react';

const AddDataForm = () => {
  const [movieTitle, setMovieTitle] = useState('');
  const [movieYear, setMovieYear] = useState('');
  const [movieTagline, setMovieTagline] = useState('');
  const [personName, setPersonName] = useState('');
  const [personRole, setPersonRole] = useState('ACTED_IN');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const addData = async () => {
    if (!movieTitle || !movieYear) {
      setMessage('Enter the name and year');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:5001/api/add-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieTitle, movieYear, movieTagline, personName, personRole })
      });
      const data = await res.json();
      setMessage(data.message || data.error);
    } catch (err) {
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Add a movie/person</h2>
      <div className="space-y-3">
        <input placeholder="Movie title" className="w-full border p-2 rounded" value={movieTitle} onChange={e => setMovieTitle(e.target.value)} />
        <input placeholder="Year" className="w-full border p-2 rounded" value={movieYear} onChange={e => setMovieYear(e.target.value)} />
        <input placeholder="Slogan (optional)" className="w-full border p-2 rounded" value={movieTagline} onChange={e => setMovieTagline(e.target.value)} />
        <input placeholder="Person's name (optional)" className="w-full border p-2 rounded" value={personName} onChange={e => setPersonName(e.target.value)} />
        <select className="w-full border p-2 rounded" value={personRole} onChange={e => setPersonRole(e.target.value)}>
          <option value="ACTED_IN">Actor</option>
          <option value="DIRECTED">Director</option>
          <option value="PRODUCED">Producer</option>
          <option value="WROTE">Screenwriter</option>
        </select>
        <button
          onClick={addData}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded disabled:bg-gray-400"
        >
          {loading ? 'Addition...' : 'Add'}
        </button>
        {message && <p className={message.includes('successfully') ? 'text-green-600' : 'text-red-600'}>{message}</p>}
      </div>
    </div>
  );
};

export default AddDataForm;