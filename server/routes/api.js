const express = require('express');
const router = express.Router();
const driver = require('../neo4j/db');
const neo4j = require('neo4j-driver');


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
  const session = driver.session();
  try {
    const result = await session.run('MATCH (m:Movie) RETURN m.title AS title ORDER BY title');
    const movies = result.records.map(r => r.get('title'));
    res.json(movies);
  } catch (err) {
    console.error('Error /movies:', err);
    res.status(500).json({ error: 'Failed to fetch movies' });
  } finally {
    await session.close();
  }
});


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

router.get('/movie/:title', async (req, res) => {
  const title = decodeURIComponent(req.params.title);
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (m:Movie {title: $title})
       OPTIONAL MATCH (p:Person)-[r:ACTED_IN|DIRECTED|PRODUCED|WROTE]->(m)
       RETURN m, collect({person: p.name, role: type(r)}) AS people`,
      { title }
    );

    if (result.records.length === 0) return res.status(404).json({ error: 'Movie not found' });

    const record = result.records[0];
    const movie = toNative(record.get('m').properties);
    const people = record.get('people').map(p => ({ person: p.person, role: p.role }));
    res.json({ ...movie, people });
  } catch (err) {
    console.error('Error /movie:', err);
    res.status(500).json({ error: 'Failed to fetch movie' });
  } finally {
    await session.close();
  }
});

router.get('/actor/:name', async (req, res) => {
  const name = decodeURIComponent(req.params.name);
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (p:Person {name: $name})-[:ACTED_IN]->(m:Movie)
       RETURN m.title AS title ORDER BY title`,
      { name }
    );
    const movies = result.records.map(r => r.get('title'));
    res.json(movies);
  } catch (err) {
    console.error('Error /actor:', err);
    res.status(500).json({ error: 'Failed to fetch actor movies' });
  } finally {
    await session.close();
  }
});

router.get('/director-producer/:name', async (req, res) => {
  const name = decodeURIComponent(req.params.name);
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
    res.json(movies);
  } catch (err) {
    console.error('Error /director-producer:', err);
    res.status(500).json({ error: 'Failed to fetch director/producer movies' });
  } finally {
    await session.close();
  }
});

router.get('/related-movies/:title', async (req, res) => {
  const title = decodeURIComponent(req.params.title);
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
    res.json(movies);
  } catch (err) {
    console.error('Error /related-movies:', err);
    res.status(500).json({ error: 'Failed to fetch related movies' });
  } finally {
    await session.close();
  }
});

router.post('/add-data', async (req, res) => {
  const { movieTitle, movieYear, movieTagline, personName, personRole } = req.body;
  if (!movieTitle || !movieYear) {
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
    res.json({ message: 'Data added successfully' });
  } catch (err) {
    console.error('Error /add-data:', err);
    res.status(500).json({ error: 'Failed to add data' });
  } finally {
    await session.close();
  }
});

router.get('/top-actor', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (p:Person)-[:ACTED_IN]->(m:Movie)
       RETURN p.name AS name, COUNT(m) AS count
       ORDER BY count DESC LIMIT 1`
    );
    if (result.records.length === 0) {
      return res.json({ name: 'No actors', movieCount: 0 });
    }
    const r = result.records[0];
    res.json({ name: r.get('name'), movieCount: r.get('count').toNumber() });
  } catch (err) {
    console.error('Error /top-actor:', err);
    res.status(500).json({ error: 'Failed to fetch top actor' });
  } finally {
    await session.close();
  }
});

module.exports = router;