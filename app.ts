import express from 'express';
import mainRoutes from './routes/mainRoutes.js';

const app = express();

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// View engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Routes
app.use('/', mainRoutes);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});