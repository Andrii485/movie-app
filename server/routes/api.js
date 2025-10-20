const express = require('express');
const router = express.Router();
const driver = require('../neo4j/db');

router.get('/movies', async (req, res) => {
  console.log('Fetching movies...');
  const session = driver.session();
  try {
    const result = await session.run('MATCH (m:Movie) RETURN m.title ORDER BY m.title');
    const movies = result.records.map(record => record.get('m.title'));
    console.log('Movies fetched:', movies);
    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Error fetching movies' });
  } finally {
    await session.close();
  }
});

router.get('/people', async (req, res) => {
  console.log('Fetching people...');
  const session = driver.session();
  try {
    const result = await session.run('MATCH (p:Person) RETURN p.name ORDER BY p.name');
    const people = result.records.map(record => record.get('p.name'));
    console.log('People fetched:', people);
    res.json(people);
  } catch (error) {
    console.error('Error fetching people:', error);
    res.status(500).json({ error: 'Error fetching people' });
  } finally {
    await session.close();
  }
});

router.get('/movie/:title', async (req, res) => {
  console.log('Fetching movie details for title:', req.params.title);
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (m:Movie {title: $title})
       OPTIONAL MATCH (p:Person)-[r:ACTED_IN|DIRECTED|PRODUCED|WROTE]->(m)
       RETURN m, collect({person: p.name, role: type(r)}) AS people`,
      { title: req.params.title }
    );
    const record = result.records[0];
    if (!record) {
      console.log('Movie not found:', req.params.title);
      return res.status(404).json({ error: 'Movie not found' });
    }
    const movie = record.get('m').properties;
    const people = record.get('people');
    console.log('Movie details fetched:', { ...movie, people });
    res.json({ ...movie, people });
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).json({ error: 'Error fetching movie details' });
  } finally {
    await session.close();
  }
});

router.get('/actor/:name', async (req, res) => {
  console.log('Fetching movies for actor:', req.params.name);
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (p:Person {name: $name})-[:ACTED_IN]->(m:Movie)
       RETURN m.title ORDER BY m.title`,
      { name: req.params.name }
    );
    const movies = result.records.map(record => record.get('m.title'));
    console.log('Movies for actor fetched:', { actor: req.params.name, movies });
    res.json(movies);
  } catch (error) {
    console.error('Error fetching actor movies:', error);
    res.status(500).json({ error: 'Error fetching actor movies' });
  } finally {
    await session.close();
  }
});

router.get('/director-producer/:name', async (req, res) => {
  console.log('Fetching movies for director/producer:', req.params.name);
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (p:Person {name: $name})-[r:DIRECTED|PRODUCED]->(m:Movie)
       RETURN m.title, type(r) AS role ORDER BY m.title`,
      { name: req.params.name }
    );
    const movies = result.records.map(record => ({
      title: record.get('m.title'),
      role: record.get('role')
    }));
    console.log('Movies for director/producer fetched:', { person: req.params.name, movies });
    res.json(movies);
  } catch (error) {
    console.error('Error fetching director/producer movies:', error);
    res.status(500).json({ error: 'Error fetching director/producer movies' });
  } finally {
    await session.close();
  }
});

router.get('/related-movies/:title', async (req, res) => {
  console.log('Fetching related movies for:', req.params.title);
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (m:Movie {title: $title})<-[r:DIRECTED|PRODUCED]-(p:Person)
       MATCH (p)-[r2:DIRECTED|PRODUCED]->(m2:Movie)
       WHERE m2.title <> $title
       RETURN DISTINCT m2.title, type(r2) AS role ORDER BY m2.title`,
      { title: req.params.title }
    );
    const movies = result.records.map(record => ({
      title: record.get('m2.title'),
      role: record.get('role')
    }));
    console.log('Related movies fetched:', { movie: req.params.title, movies });
    res.json(movies);
  } catch (error) {
    console.error('Error fetching related movies:', error);
    res.status(500).json({ error: 'Error fetching related movies' });
  } finally {
    await session.close();
  }
});

router.post('/add-data', async (req, res) => {
  console.log('Adding data with body:', req.body);
  const { movieTitle, movieYear, movieTagline, personName, personRole } = req.body;
  if (!movieTitle || !movieYear) {
    console.log('Validation failed: Missing movie title or year');
    return res.status(400).json({ error: 'Movie title and year are required' });
  }
  const session = driver.session();
  try {
    await session.run(
      `MERGE (m:Movie {title: $title})
       SET m.released = $released, m.tagline = $tagline`,
      { title: movieTitle, released: parseInt(movieYear), tagline: movieTagline || '' }
    );
    if (personName) {
      await session.run(
        `MERGE (p:Person {name: $name})
         MERGE (m:Movie {title: $title})
         MERGE (p)-[:${personRole}]->(m)`,
        { name: personName, title: movieTitle }
      );
    }
    console.log('Data added successfully:', { movieTitle, movieYear, personName, personRole });
    res.json({ message: 'Data added successfully' });
  } catch (error) {
    console.error('Error adding data:', error);
    res.status(500).json({ error: 'Error adding data' });
  } finally {
    await session.close();
  }
});

router.get('/top-actor', async (req, res) => {
  console.log('Fetching top actor...');
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (p:Person)-[:ACTED_IN]->(m:Movie)
       RETURN p.name, COUNT(m) AS movie_count
       ORDER BY movie_count DESC
       LIMIT 1`
    );
    const record = result.records[0];
    if (record) {
      const topActor = {
        name: record.get('p.name'),
        movieCount: record.get('movie_count').toNumber()
      };
      console.log('Top actor fetched:', topActor);
      res.json(topActor);
    } else {
      console.log('No actors found');
      res.json({ name: 'No actors found', movieCount: 0 });
    }
  } catch (error) {
    console.error('Error fetching top actor:', error);
    res.status(500).json({ error: 'Error fetching top actor' });
  } finally {
    await session.close();
  }
});

module.exports = router;