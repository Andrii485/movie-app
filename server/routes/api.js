const express = require('express');
const router = express.Router();
const driver = require('../neo4j/db');
const neo4j = require('neo4j-driver');

// Утилита для конвертации Neo4j Integer → Number
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
  console.log('GET /api/movies');
  const session = driver.session();
  try {
    const result = await session.run('MATCH (m:Movie) RETURN m.title AS title ORDER BY title');
    const movies = result.records.map(r => r.get('title'));
    console.log('Movies:', movies.length);
    res.json(movies);
  } catch (err) {
    console.error('Error /movies:', err);
    res.status(500).json({ error: 'Failed to fetch movies' });
  } finally {
    await session.close();
  }
});

router.get('/movie/:title', async (req, res) => {
  const title = decodeURIComponent(req.params.title);
  console.log('GET /api/movie/', title);
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (m:Movie {title: $title})
       OPTIONAL MATCH (p:Person)-[r:ACTED_IN|DIRECTED|PRODUCED|WROTE]->(m)
       RETURN m, collect({person: p.name, role: type(r)}) AS people`,
      { title }
    );

    if (result.records.length === 0) {
      console.log('Movie not found:', title);
      return res.status(404).json({ error: 'Movie not found' });
    }

    const record = result.records[0];
    const movie = toNative(record.get('m').properties);
    const people = record.get('people').map(p => ({
      person: p.person,
      role: p.role
    }));

    console.log('Movie fetched:', movie.title, 'People:', people.length);
    res.json({ ...movie, people });
  } catch (err) {
    console.error('Error /movie:', err);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  } finally {
    await session.close();
  }
});

// Остальные эндпоинты (коротко, но с защитой)
router.get('/people', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (p:Person) RETURN p.name AS name ORDER BY name');
    const people = result.records.map(r => r.get('name'));
    res.json(people);
  } catch (err) {
    console.error('Error /people:', err);
    res.status(500).json({ error: 'Failed to fetch people' });
  } finally {
    await session.close();
  }
});

router.get('/top-actor', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (p:Person)-[:ACTED_IN]->(m:Movie)
       RETURN p.name, COUNT(m) AS count
       ORDER BY count DESC LIMIT 1`
    );
    if (result.records.length === 0) {
      return res.json({ name: 'No actors', movieCount: 0 });
    }
    const r = result.records[0];
    res.json({ name: r.get('p.name'), movieCount: r.get('count').toNumber() });
  } catch (err) {
    console.error('Error /top-actor:', err);
    res.status(500).json({ error: 'Failed to fetch top actor' });
  } finally {
    await session.close();
  }
});

// Добавьте остальные эндпоинты по аналогии...

module.exports = router;