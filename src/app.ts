import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from "dotenv";
import { searchRouter } from './api/routes/searchResults';
import { localsRouter } from './api/routes/localsRouter';
import { eventsRouter } from './api/routes/eventsRouter';
import { authRouter } from './api/routes/authRouter';
import { userRouter } from './api/routes/userRouter';
import { chatsRouter } from './api/routes/chatsRouter';

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
app.use(`${API_URL}/searchResults`, searchRouter);
app.use(`${API_URL}/locals`, localsRouter);
app.use(`${API_URL}/events`, eventsRouter);
app.use(`${API_URL}/auth`, authRouter);
app.use(`${API_URL}/users`, userRouter);
app.use(`${API_URL}/chats`, chatsRouter);

const PORT = process.env.PORT || 8080;
// starting the server
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});