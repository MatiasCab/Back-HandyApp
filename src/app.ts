import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from "dotenv";
import { authRouter } from './api/routes/authRouter';
import { problemsRouter } from './api/routes/problemsRouter';
import { usersRouter } from './api/routes/usersRouter';
import { reviewsRouter } from './api/routes/reviewsRouter';
import { generateBDTables } from './api/querys/createTablesQueries';
import { generateMockedData } from './api/querys/createMockData';
import { skillsRouter } from './api/routes/skillsRouter';

dotenv.config();

const CURRENT_VERSION = 'v1';
const API_URL = `/api/${CURRENT_VERSION}`;

// defining the Express app
const app = express();

// enabling CORS for all requests
app.use(cors());

// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(express.json({ limit: '20mb' }));

// adding morgan to log HTTP requests
app.use(morgan('combined'));


// define the routers
app.use(`${API_URL}/auth`, authRouter);
app.use(`${API_URL}/problems`, problemsRouter);
app.use(`${API_URL}/users`, usersRouter);
app.use(`${API_URL}/reviews`, reviewsRouter);
app.use(`${API_URL}/skills`, skillsRouter);

const PORT = process.env.PORT || 8080;
// starting the server
app.listen(PORT, async () => {
  try {
    await generateBDTables();
    await generateMockedData();
    console.log('Inicializations operations ready');
  } catch (error) {
    console.log('Error in inicializations operations:', error);
  } finally {
    console.log(`listening on port ${PORT}`);
  }
});