const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');
const { ecsFormat } = require('@elastic/ecs-winston-format');
const { Client } = require('@elastic/elasticsearch');

const esClient = new Client({
  node: 'http://localhost:9200',
  auth: { username: 'elastic', password: 'QOT907TNB5NiSOdwjyXi' },
  maxRetries: 3,
  requestTimeout: 10000,
  sniffOnStart: false
});

esClient.ping()
  .then(() => console.log('Elasticsearch підключено успішно'))
  .catch(err => console.error('Помилка підключення до Elasticsearch:', err.message));

const esTransport = new ElasticsearchTransport({
  level: 'info',
  client: esClient,
  index: 'movie-app-logs',
  flushInterval: 5000, 
  buffering: true,
  bufferLimit: 1000,    
  ecs: true,

  ensureIndexTemplate: true,
  indexTemplate: {
    name: 'movie-app-logs-template',
    body: {
      index_patterns: ['movie-app-logs*'],
      template: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
          'index.lifecycle.name': '30-days-retention' 
        },
        mappings: {
          dynamic: 'strict',
          properties: {
            '@timestamp': { type: 'date' },
            log: { type: 'object', enabled: false },
            message: { type: 'text' },
            action: { type: 'keyword' },
            level: { type: 'keyword' },
            user_ip: { type: 'ip' },
            user_agent: { type: 'text' },
            movie_title: { type: 'text', fields: { keyword: { type: 'keyword' } } },
            person_name: { type: 'text' },
            person_role: { type: 'keyword' },
            error: { type: 'text' },
            stack: { type: 'text' },
            duration_ms: { type: 'float' },
            request_id: { type: 'keyword' }
          }
        }
      }
    }
  }
});

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, action, movie_title, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message} ${action ? `[${action}]` : ''}${movie_title ? ` | ${movie_title}` : ''}${metaStr}`;
  })
);

const logger = winston.createLogger({
  format: ecsFormat({ convertReqRes: true }),
  transports: [esTransport],
  exitOnError: false
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

esTransport.on('warning', (err) => {
  console.warn('Elasticsearch Transport Warning:', err.message);
});

esTransport.on('error', (err) => {
  console.error('Elasticsearch Transport Error:', err.message);
});

module.exports = logger;