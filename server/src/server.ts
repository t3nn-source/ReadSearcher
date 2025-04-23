import express from 'express';
import path from 'path';
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

if (process.env.NODE_ENV === 'production') {
  const clientPath = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientPath));

  
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

app.listen(PORT, () => {
console.log(`server running on port ${PORT}!`);
});