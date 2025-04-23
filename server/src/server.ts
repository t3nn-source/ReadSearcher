import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import './config/connection.js';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import typeDefs from './schemas/typeDefs.js';
import  resolvers from './schemas/resolvers.js';
import { expressMiddleware } from '@apollo/server/express4';
import { authenticateToken } from './services/auth.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
console.log('NODE_ENV:', process.env.NODE_ENV);
const app = express();
const PORT = process.env.PORT || 4000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  '/graphql',
  expressMiddleware(server, {
    context: async ({ req }) => {
     const user = authenticateToken(req);
      return { user };
    },
  })
);


// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(path.resolve(), '../../client/dist/index.html'));
  });
}




app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}/graphql`)
);