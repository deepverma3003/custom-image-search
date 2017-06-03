const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/urls';

const client = new pg.Client(connectionString);
client.connect();
const query = client.query(
  'CREATE TABLE image_search(id SERIAL PRIMARY KEY, query VARCHAR(40) not null, created_at timestamp without time zone)');
query.on('end', () => { client.end(); });