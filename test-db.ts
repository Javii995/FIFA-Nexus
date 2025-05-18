// Sla dit op als test-db.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';
console.log('Proberen verbinding te maken met:', MONGODB_URI.replace(/:[^:]*@/, ':****@')); // Verberg wachtwoord in logs

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB verbinding succesvol!');
        process.exit(0);
    })
    .catch(error => {
        console.error('MongoDB verbindingsfout:', error);
        process.exit(1);
    });