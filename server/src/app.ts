import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://eiu-archive.vercel.app'
  ],
  credentials: true
}));