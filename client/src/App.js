import React, { useState, useEffect } from 'react';
import MovieSelector from './components/MovieSelector';
import ActorSelector from './components/ActorSelector';
import DirectorProducerSelector from './components/DirectorProducerSelector';
import RelatedMovies from './components/RelatedMovies';
import AddDataForm from './components/AddDataForm';
import TopActor from './components/TopActor';

const App = () => {
  const [movies, setMovies] = useState([]);
  const [people, setPeople] = useState([]);
  const [activeTab, setActiveTab] = useState('movie');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const refreshData = async () => {
    try {
      const [moviesRes, peopleRes] = await Promise.all([
        fetch('http://localhost:5000/api/movies'),
        fetch('http://localhost:5000/api/people')
      ]);

      if (!moviesRes.ok || !peopleRes.ok) throw new Error('Failed to refresh data');

      const moviesData = await moviesRes.json();
      const peopleData = await peopleRes.json();

      setMovies(moviesData);
      setPeople(peopleData);
    } catch (err) {
      console.error('Refresh failed:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await refreshData();
      } catch (err) {
        setError('Failed to load data. Check if the server is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const tabs = [
    { id: 'movie', label: 'Movies', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z' },
    { id: 'actor', label: 'Actors', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'director', label: 'Directors & Producers', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
    { id: 'related', label: 'Related Movies', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'add', label: 'Add Data', icon: 'M12 4v16m8-8H4' },
    { id: 'top', label: 'Top Actor', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' }
  ];

  const headerStyle = "bg-black/50 backdrop-blur-lg border-b border-purple-500";
  const containerStyle = "max-w-7xl mx-auto px-6";
  const tabButtonActive = "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg";
  const tabButtonInactive = "text-purple-300 hover:text-white hover:bg-white/10";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-800 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">Warning</div>
          <p className="text-gray-800 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col">
      <header className={headerStyle}>
        <div className={containerStyle + " py-5"}>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Neo4j Movies
          </h1>
        </div>
      </header>

      <div className={containerStyle + " mt-8"}>
        <div className="flex flex-wrap gap-2 bg-black/30 backdrop-blur-md p-2 rounded-xl shadow-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.id ? tabButtonActive : tabButtonInactive
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1">
        <div className={containerStyle + " py-8"}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {activeTab === 'movie' && <MovieSelector movies={movies} />}
            {activeTab === 'actor' && <ActorSelector people={people} />}
            {activeTab === 'director' && <DirectorProducerSelector people={people} />}
            {activeTab === 'related' && <RelatedMovies movies={movies} />}
            {activeTab === 'add' && <AddDataForm onSuccess={refreshData} />}
            {activeTab === 'top' && <TopActor />}
          </div>
        </div>
      </main>

      <footer className="mt-auto py-6 text-center text-purple-300 text-sm bg-black/30 backdrop-blur-md border-t border-purple-500">
        <p>© 2025 Neo4j Movies App • <span className="text-pink-400">Bondarenko Andrii</span></p>
      </footer>
    </div>
  );
};

export default App;