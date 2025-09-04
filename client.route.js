import express from 'express';
import { ObjectId } from 'mongodb';
import ClientDto from './dtos/client.dto.js';

export default function clientRoute(db) {
    const route = express.Router();

    route.post('/', async (req, res) => {
        const clientData = new ClientDto(req.body);
        const result = await db.collection('clientes').insertOne(clientData);
        res.status(201).json({ message: 'Cliente creado exitosamente', id: result.insertedId });
    });

    route.get('/', async (req, res) => {
        const clients = await db.collection('clientes').find().toArray();
        res.json(clients);
    });

    route.get('/:id', async (req, res) => {
        const client = await db.collection('clientes').findOne({ _id: ObjectId.createFromHexString(req.params.id) });
        if (client) {
            res.json(client);
        } else {
            res.status(404).json({ message: 'Cliente no encontrado' });
        }
    });

    route.put('/:id', async (req, res) => {
        const updatedClient = req.body;
        const result = await db.collection('clientes').updateOne(
            { _id: ObjectId.createFromHexString(req.params.id) },
            { $set: updatedClient }
        );
        if (result.modifiedCount > 0) {
            res.json({ message: 'Cliente actualizado exitosamente' });
        } else {
            res.status(404).json({ message: 'Cliente no encontrado' });
        }
    });

    route.delete('/:id', async (req, res) => {
        const result = await db.collection('clientes').deleteOne({ _id: ObjectId.createFromHexString(req.params.id) });
        if (result.deletedCount > 0) {
            res.json({ message: 'Cliente eliminado exitosamente' });
        } else {
            res.status(404).json({ message: 'Cliente no encontrado' });
        }
    });

    route.post('/:id/puntos', async (req, res) => {
        const { date, points } = req.body;
        if (!date || !points) {
            return res.status(400).json({ message: 'Fecha y puntos son requeridos' });
        }
        const pointEntry = {
            date: new Date(date),
            points: Number(points)
        };
        const result = await db.collection('clientes').updateOne(
            { _id: ObjectId.createFromHexString(req.params.id) },
            { $push: { puntos: pointEntry } }
        );
        if (result.modifiedCount > 0) {
            res.json({ message: 'Puntos agregados exitosamente' });
        } else {
            res.status(404).json({ message: 'Cliente no encontrado' });
        }
    });

    route.get('/reportes/fidelidad', async (req, res) => {
        const clients = await db.collection('clientes').find().toArray();

        const report = clients.map(client => {
            const pointsByMonth = {};

            (client.puntos || []).forEach(entry => {
                const month = entry.date.toISOString().slice(0, 7);
                pointsByMonth[month] = (pointsByMonth[month] || 0) + entry.points;
            });

            return {
                identification: client.identification,
                fullName: client.fullName,
                email: client.email,
                phone: client.phone,
                pointsByMonth
            };
        });

        res.json(report);
    });

    return route;
}
