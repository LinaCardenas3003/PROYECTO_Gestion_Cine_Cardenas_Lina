import express from 'express';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import userRoute from './user.route.js';
import clientRoute from './client.route.js';

const app = express();

app.use(express.static('./public'));

app.use(express.json())
const client = new MongoClient('mongodb://localhost:27017');
await client.connect();

const db = client.db('cine');

// Crear cuenta de administrador por defecto si no existe
const createDefaultAdmin = async () => {
    try {
        const adminEmail = 'admin@cineacme.com';
        const adminExists = await db.collection('users').findOne({ email: adminEmail });
        
        if (!adminExists) {
            const hashedPassword = bcrypt.hashSync('Admin123*', 10);
            const adminUser = {
                id: '000000000',
                name: 'Administrador',
                phone: 'N/A',
                email: adminEmail,
                position: 'Administrador',
                password: hashedPassword,
                role: 'admin',
                createdAt: new Date()
            };
            
            await db.collection('users').insertOne(adminUser);
            console.log('Cuenta de administrador predeterminada creada:', adminEmail);
        } else {
            // Verificar si la cuenta existente tiene todos los campos necesarios
            const updateFields = {};
            if (adminExists.id === undefined) updateFields.id = '000000000';
            if (adminExists.name === undefined) updateFields.name = 'Administrador';
            if (adminExists.phone === undefined) updateFields.phone = 'N/A';
            if (adminExists.position === undefined) updateFields.position = 'Administrador';
            
            if (Object.keys(updateFields).length > 0) {
                await db.collection('users').updateOne(
                    { email: adminEmail },
                    { $set: updateFields }
                );
                console.log('Cuenta de administrador predeterminada actualizada con campos faltantes:', adminEmail);
            } else {
                console.log('ℹCuenta de administrador ya existe:', adminEmail);
            }
        }
    } catch (error) {
        console.error('Error al crear cuenta de administrador:', error);
    }
};

await createDefaultAdmin();

app.use('/user', userRoute(db));
app.use('/client', clientRoute(db));

app.get('/api/peliculas', async (req, res) => {
    try {
        const peliculas = await db.collection('peliculas').find().toArray();
        res.json(peliculas);
    } catch (error) {
        console.error('Error fetching peliculas:', error);
        res.status(500).send('Error fetching peliculas');
    }
});

app.post('/api/peliculas', async (req, res) => {
    try {
        const newMovie = req.body;
        const result = await db.collection('peliculas').insertOne(newMovie);
        res.status(201).json({ message: 'Película agregada exitosamente', id: result.insertedId });
    } catch (error) {
        console.error('Error adding pelicula:', error);
        res.status(500).send('Error adding pelicula');
    }
});

app.listen({
    port: process.env.PORT,
    hostname: process.env.HOSTNAME
}, () => console.log('I\'m Alive Wiiiiiiiiiiiii', `Running on ${process.env.HOSTNAME}:${process.env.PORT}`));
