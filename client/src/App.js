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
  const [selectedTab, setSelectedTab] = useState('movie');

  useEffect(() => {
    // Fetch movies and people
    const fetchData = async () => {
      try {
        const [moviesRes, peopleRes] = await Promise.all([
          fetch('http://localhost:5001/api/movies'),
          fetch('http://localhost:5001/api/people')
        ]);
        const moviesData = await moviesRes.json();
        const peopleData = await peopleRes.json();
        setMovies(moviesData);
        setPeople(peopleData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Movies Neo4j App</h1>
      <div className="tabs mb-4">
        <button
          className={`mr-2 p-2 ${selectedTab === 'movie' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedTab('movie')}
        >
          Movie Details
        </button>
        <button
          className={`mr-2 p-2 ${selectedTab === 'actor' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedTab('actor')}
        >
          Actor Films
        </button>
        <button
          className={`mr-2 p-2 ${selectedTab === 'director' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedTab('director')}
        >
          Director/Producer Films
        </button>
        <button
          className={`mr-2 p-2 ${selectedTab === 'related' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedTab('related')}
        >
          Related Movies
        </button>
        <button
          className={`mr-2 p-2 ${selectedTab === 'add' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedTab('add')}
        >
          Add Data
        </button>
        <button
          className={`p-2 ${selectedTab === 'topActor' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedTab('topActor')}
        >
          Top Actor
        </button>
      </div>

      {selectedTab === 'movie' && <MovieSelector movies={movies} />}
      {selectedTab === 'actor' && <ActorSelector people={people} />}
      {selectedTab === 'director' && <DirectorProducerSelector people={people} />}
      {selectedTab === 'related' && <RelatedMovies movies={movies} />}
      {selectedTab === 'add' && <AddDataForm />}
      {selectedTab === 'topActor' && <TopActor />}
    </div>
  );
};

export default App;