import React, { useState } from 'react';

const AddDataForm = ({ onSuccess }) => {
  const [movieTitle, setMovieTitle] = useState('');
  const [movieYear, setMovieYear] = useState('');
  const [movieTagline, setMovieTagline] = useState('');
  const [personName, setPersonName] = useState('');
  const [personRole, setPersonRole] = useState('ACTED_IN');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const addData = async () => {
    if (!movieTitle || !movieYear) {
      setMessage('Enter title and year');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/add-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieTitle, movieYear, movieTagline, personName, personRole })
      });
      const data = await res.json();
      setMessage(data.message || data.error);

      if (data.message && data.message.includes('successfully')) {
        setMovieTitle('');
        setMovieYear('');
        setMovieTagline('');
        setPersonName('');
        setPersonRole('ACTED_IN');

        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-cyan-900 to-blue-900 p-6 rounded-2xl shadow-2xl text-white transform transition-all hover:scale-[1.01]">
      <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
        <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Data
      </h2>

      <div className="space-y-4">
        <input
          placeholder="Movie title"
          className="w-full bg-white bg-opacity-20 backdrop-blur-md border border-cyan-400 rounded-lg px-4 py-3 text-white placeholder-cyan-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={movieTitle}
          onChange={e => setMovieTitle(e.target.value)}
        />
        <input
          placeholder="Year"
          className="w-full bg-white bg-opacity-20 backdrop-blur-md border border-cyan-400 rounded-lg px-4 py-3 text-white placeholder-cyan-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={movieYear}
          onChange={e => setMovieYear(e.target.value)}
        />
        <input
          placeholder="Slogan (optional)"
          className="w-full bg-white bg-opacity-20 backdrop-blur-md border border-cyan-400 rounded-lg px-4 py-3 text-white placeholder-cyan-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={movieTagline}
          onChange={e => setMovieTagline(e.target.value)}
        />
        <input
          placeholder="Person's name (optional)"
          className="w-full bg-white bg-opacity-20 backdrop-blur-md border border-cyan-400 rounded-lg px-4 py-3 text-white placeholder-cyan-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={personName}
          onChange={e => setPersonName(e.target.value)}
        />

        <div className="relative">
          <select
            className="w-full bg-white bg-opacity-20 backdrop-blur-md border border-cyan-400 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer pr-10"
            value={personRole}
            onChange={e => setPersonRole(e.target.value)}
          >
            <option value="ACTED_IN" className="bg-gray-800 text-white">Actor</option>
            <option value="DIRECTED" className="bg-gray-800 text-white">Director</option>
            <option value="PRODUCED" className="bg-gray-800 text-white">Producer</option>
            <option value="WROTE" className="bg-gray-800 text-white">Screenwriter</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <button
          onClick={addData}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 transition shadow-lg"
        >
          {loading ? 'Adding...' : 'Add to database'}
        </button>

        {message && (
          <div className={`p-3 rounded-lg text-center font-medium ${message.includes('successfully') ? 'bg-green-900 bg-opacity-80 text-green-200' : 'bg-red-900 bg-opacity-80 text-red-200'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddDataForm;