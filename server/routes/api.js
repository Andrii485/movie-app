const express = require('express');
const router = express.Router();
const driver = require('../neo4j/db');
const neo4j = require('neo4j-driver');
const logger = require('../logger'); 

const toNative = (value) => {
  if (value === null || value === undefined) return value;
  if (value instanceof neo4j.types.Integer) return value.toNumber();
  if (Array.isArray(value)) return value.map(toNative);
  if (typeof value === 'object') {
    const obj = {};
    for (const key in value) obj[key] = toNative(value[key]);
    return obj;
  }
  return value;
};

router.get('/movies', async (req, res) => {
  logger.info('Get all movies', { action: 'get_movies', user_ip: req.ip }); 
  const session = driver.session();
  try {
    const result = await session.run('MATCH (m:Movie) RETURN m.title AS title ORDER BY title');
    const movies = result.records.map(r => r.get('title'));
    logger.info('ovies loaded', { count: movies.length }); 
    res.json(movies);
  } catch (err) {
    logger.error('Error loading movies', { 
      action: 'get_movies', 
      error: err.message,
      user_ip: req.ip 
    }); 
    res.status(500).json({ error: 'Failed to fetch movies' });
  } finally {
    await session.close();
  }
});

router.get('/people', async (req, res) => {
  logger.info('Get all people', { action: 'get_people', user_ip: req.ip });
  const session = driver.session();
  try {
    const result = await session.run('MATCH (p:Person) RETURN p.name AS name ORDER BY name');
    const people = result.records.map(r => r.get('name'));
    logger.info('People loaded', { count: people.length });
    res.json(people);
  } catch (err) {
    logger.error('Error loading people', { 
      action: 'get_people', 
      error: err.message,
      user_ip: req.ip 
    });
    res.status(500).json({ error: 'Failed to fetch people' });
  } finally {
    await session.close();
  }
});

router.get('/movie/:title', async (req, res) => {
  const title = decodeURIComponent(req.params.title);
  logger.info('Get movie details', { action: 'get_movie', movie_title: title, user_ip: req.ip });
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (m:Movie {title: $title})
       OPTIONAL MATCH (p:Person)-[r:ACTED_IN|DIRECTED|PRODUCED|WROTE]->(m)
       RETURN m, collect({person: p.name, role: type(r)}) AS people`,
      { title }
    );

    if (result.records.length === 0) {
      logger.warn('Movie not found', { movie_title: title, user_ip: req.ip });
      return res.status(404).json({ error: 'Movie not found' });
    }

    const record = result.records[0];
    const movie = toNative(record.get('m').properties);
    const people = record.get('people').map(p => ({ person: p.person, role: p.role }));
    logger.info('Movie details loaded', { 
      movie_title: title, 
      people_count: people.length,
      user_ip: req.ip 
    });
    res.json({ ...movie, people });
  } catch (err) {
    logger.error('Error loading movie details', { 
      action: 'get_movie', 
      movie_title: title,
      error: err.message,
      user_ip: req.ip 
    });
    res.status(500).json({ error: 'Failed to fetch movie' });
  } finally {
    await session.close();
  }
});

router.get('/actor/:name', async (req, res) => {
  const name = decodeURIComponent(req.params.name);
  logger.info('Get actor movies', { action: 'get_actor_movies', actor_name: name, user_ip: req.ip });
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (p:Person {name: $name})-[:ACTED_IN]->(m:Movie)
       RETURN m.title AS title ORDER BY title`,
      { name }
    );
    const movies = result.records.map(r => r.get('title'));
    logger.info('Actor movies loaded', { 
      actor_name: name, 
      movies_count: movies.length,
      user_ip: req.ip 
    });
    res.json(movies);
  } catch (err) {
    logger.error('Error loading actor movies', { 
      action: 'get_actor_movies', 
      actor_name: name,
      error: err.message,
      user_ip: req.ip 
    });
    res.status(500).json({ error: 'Failed to fetch actor movies' });
  } finally {
    await session.close();
  }
});

router.get('/director-producer/:name', async (req, res) => {
  const name = decodeURIComponent(req.params.name);
  logger.info('Get director/producer movies', { action: 'get_director_movies', person_name: name, user_ip: req.ip });
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (p:Person {name: $name})-[r:DIRECTED|PRODUCED]->(m:Movie)
       RETURN m.title AS title, type(r) AS role ORDER BY title`,
      { name }
    );
    const movies = result.records.map(r => ({
      title: r.get('title'),
      role: r.get('role')
    }));
    logger.info('Director movies loaded', { 
      person_name: name, 
      movies_count: movies.length,
      user_ip: req.ip 
    });
    res.json(movies);
  } catch (err) {
    logger.error('Error loading director movies', { 
      action: 'get_director_movies', 
      person_name: name,
      error: err.message,
      user_ip: req.ip 
    });
    res.status(500).json({ error: 'Failed to fetch director/producer movies' });
  } finally {
    await session.close();
  }
});

router.get('/related-movies/:title', async (req, res) => {
  const title = decodeURIComponent(req.params.title);
  logger.info('Get related movies', { action: 'get_related_movies', movie_title: title, user_ip: req.ip });
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (m:Movie {title: $title})<-[r:DIRECTED|PRODUCED]-(p:Person)
       MATCH (p)-[r2:DIRECTED|PRODUCED]->(m2:Movie)
       WHERE m2.title <> $title
       RETURN DISTINCT m2.title AS title, type(r2) AS role ORDER BY title`,
      { title }
    );
    const movies = result.records.map(r => ({
      title: r.get('title'),
      role: r.get('role')
    }));
    logger.info('Related movies loaded', { 
      movie_title: title, 
      related_count: movies.length,
      user_ip: req.ip 
    });
    res.json(movies);
  } catch (err) {
    logger.error('Error loading related movies', { 
      action: 'get_related_movies', 
      movie_title: title,
      error: err.message,
      user_ip: req.ip 
    });
    res.status(500).json({ error: 'Failed to fetch related movies' });
  } finally {
    await session.close();
  }
});

router.post('/add-data', async (req, res) => {
  const { movieTitle, movieYear, movieTagline, personName, personRole } = req.body;
  logger.info('Add data request', { 
    action: 'add_data', 
    movie_title: movieTitle, 
    person_name: personName, 
    person_role: personRole,
    user_ip: req.ip 
  });
  
  if (!movieTitle || !movieYear) {
    logger.warn('Invalid add-data request', { 
      action: 'add_data_invalid', 
      error: 'Missing title or year',
      user_ip: req.ip 
    });
    return res.status(400).json({ error: 'Movie title and year required' });
  }
  
  const session = driver.session();
  try {
    await session.run(
      `MERGE (m:Movie {title: $title})
       SET m.released = $released, m.tagline = $tagline`,
      { title: movieTitle, released: parseInt(movieYear), tagline: movieTagline || null }
    );
    
    if (personName && personRole) {
      await session.run(
        `MERGE (p:Person {name: $name})
         MERGE (m:Movie {title: $title})
         MERGE (p)-[:${personRole}]->(m)`,
        { name: personName, title: movieTitle }
      );
    }
    
    logger.info('Data added successfully', { 
      action: 'add_data_success', 
      movie_title: movieTitle, 
      person_name: personName,
      person_role: personRole,
      user_ip: req.ip 
    });
    res.json({ message: 'Data added successfully' });
  } catch (err) {
    logger.error('Error adding data', { 
      action: 'add_data_error', 
      movie_title: movieTitle, 
      person_name: personName,
      error: err.message,
      user_ip: req.ip 
    });
    res.status(500).json({ error: 'Failed to add data' });
  } finally {
    await session.close();
  }
});

router.get('/top-actor', async (req, res) => {
  logger.info('Get top actor', { action: 'get_top_actor', user_ip: req.ip });
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (p:Person)-[:ACTED_IN]->(m:Movie)
       RETURN p.name AS name, COUNT(m) AS count
       ORDER BY count DESC LIMIT 1`
    );
    if (result.records.length === 0) {
      logger.warn('No actors found', { action: 'get_top_actor_empty' });
      return res.json({ name: 'No actors', movieCount: 0 });
    }
    const r = result.records[0];
    const topActor = { name: r.get('name'), movieCount: r.get('count').toNumber() };
    logger.info('Top actor loaded', { 
      action: 'get_top_actor_success',
      actor_name: topActor.name,
      movie_count: topActor.movieCount,
      user_ip: req.ip 
    });
    res.json(topActor);
  } catch (err) {
    logger.error('Error loading top actor', { 
      action: 'get_top_actor_error',
      error: err.message,
      user_ip: req.ip 
    });
    res.status(500).json({ error: 'Failed to fetch top actor' });
  } finally {
    await session.close();
  }
});

module.exports = router;