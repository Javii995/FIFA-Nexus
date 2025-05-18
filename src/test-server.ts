// Sla dit op als src/test-server.ts
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('FIFA Nexus Test Server is actief!');
});

app.listen(PORT, () => {
    console.log(`Test server draait op http://localhost:${PORT}`);
});