
import express from 'express';
import path from 'path';
import { apiService } from './services/apiService';

const app = express();
const PORT = process.env.PORT || 5500;


app.use(express.json());



app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/clubs', async (req, res) => {
  console.log('API clubs endpoint aangeroepen');
  try {
    const clubs = await apiService.getClubs();
    console.log('API response:', JSON.stringify(clubs).substring(0, 100) + '...');
    res.json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ error: 'Failed to fetch clubs' });
  }
});


app.get('/:page.html', (req, res) => {
  const pagePath = path.join(__dirname, '../', req.params.page + '.html');
  console.log('Serving HTML page:', pagePath);
  res.sendFile(pagePath);
});


app.get('/', (req, res) => {
  res.redirect('/home.html');
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

