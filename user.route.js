import express from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

import { createUserValidator, loginValidator } from './middlewares/user.validator.js';
import UserCreateDto from './dtos/user.create.dto.js'
import ProfileDto from './dtos/profile.dto.js';
import verifyToken from './middlewares/auth.middleware.js';

import { ReportesCine } from './raw-data/reportes.js';

export default function userRoute(db){
    const route = express.Router();

    const reportes = new ReportesCine();

    route.post('/register', createUserValidator, async (req, res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ message: 'Error de validaciòn', errors });
        }
        req.body.password = bcrypt.hashSync(req.body.password, 10);
        const result = await db.collection('users').insertOne(new UserCreateDto(req.body));
        res.json(result);
    });

    route.post('/login', loginValidator, async (req, res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ message: 'Error de validación', errors });
        }

        const user = await db.collection('users').findOne({ email: req.body.email });
        
        if(user){
            if( bcrypt.compareSync(req.body.password, user.password)){
                const token = jwt.sign({sub:user._id, email: user.email}, process.env.SECRET_JWT_KEY)
                res.json({token, user: new ProfileDto(user)});
            }
            else res.json({ message: 'Error', error: 'Autenticación fallida.'});
        }
        else{
            res.json({ message: 'Error', error: 'Autenticación fallida.'});
        }
    });

    route.get('/', verifyToken,async (req, res)=>{
        const users = await db.collection('users').find({ }).toArray();
        const usersMap = users.map( user =>{
            return new ProfileDto(user)
        });
        res.json(usersMap);
    });



    route.delete('/:id', verifyToken,async (req, res)=>{
        const result = await db.collection('users').deleteOne({ _id: ObjectId.createFromHexString(req.params.id) });
        if(result.deletedCount > 0){
            res.json({message: 'done'});
        }
        else res.json({message: 'fail'});
        
    })

    // Rutas CRUD para Cines
    route.get('/cines', async (req, res) => {
        const cines = await db.collection('cines').find({}).toArray();
        res.json(cines);
    });

    route.post('/cines', async (req, res) => {
        const newCine = req.body;
        const result = await db.collection('cines').insertOne(newCine);
        res.status(201).json({ message: 'Cine agregado exitosamente', id: result.insertedId });
    });

    route.put('/cines/:id', async (req, res) => {
        const updatedCine = req.body;
        const result = await db.collection('cines').updateOne(
            { _id: ObjectId.createFromHexString(req.params.id) },
            { $set: updatedCine }
        );
        if (result.modifiedCount > 0) {
            res.json({ message: 'Cine actualizado exitosamente' });
        } else {
            res.status(404).json({ message: 'Cine no encontrado' });
        }
    });

    route.delete('/cines/:id', async (req, res) => {
        const result = await db.collection('cines').deleteOne({ _id: ObjectId.createFromHexString(req.params.id) });
        if (result.deletedCount > 0) {
            res.json({ message: 'Cine eliminado exitosamente' });
        } else {
            res.status(404).json({ message: 'Cine no encontrado' });
        }
    });

    // Rutas CRUD para Salas dentro de Cines
    route.get('/cines/:id', async (req, res) => {
        try {
            const cine = await db.collection('cines').findOne({ _id: ObjectId.createFromHexString(req.params.id) });
            if (cine) {
                res.json(cine);
            } else {
                res.status(404).json({ message: 'Cine no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener el cine', error: error.message });
        }
    });

    route.post('/cines/:id/salas', async (req, res) => {
        try {
            const cineId = req.params.id;
            const newSala = req.body;
            newSala._id = new ObjectId(); // Generar un nuevo ID para la sala
            
            const result = await db.collection('cines').updateOne(
                { _id: ObjectId.createFromHexString(cineId) },
                { $push: { salas: newSala } }
            );
            
            if (result.modifiedCount > 0) {
                res.status(201).json({ message: 'Sala agregada exitosamente', id: newSala._id });
            } else {
                res.status(404).json({ message: 'Cine no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al agregar la sala', error: error.message });
        }
    });

    route.delete('/cines/:cineId/salas/:salaId', async (req, res) => {
        try {
            const { cineId, salaId } = req.params;
            
            const result = await db.collection('cines').updateOne(
                { _id: ObjectId.createFromHexString(cineId) },
                { $pull: { salas: { _id: ObjectId.createFromHexString(salaId) } } }
            );
            
            if (result.modifiedCount > 0) {
                res.json({ message: 'Sala eliminada exitosamente' });
            } else {
                res.status(404).json({ message: 'Cine o sala no encontrada' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar la sala', error: error.message });
        }
    });

    // Rutas CRUD para Funciones dentro de Salas dentro de Cines
    route.get('/cines/:cineId/salas/:salaId/funciones', async (req, res) => {
        try {
            const { cineId, salaId } = req.params;
            
            const cine = await db.collection('cines').findOne(
                { _id: ObjectId.createFromHexString(cineId) }
            );
            
            if (cine && cine.salas) {
                const sala = cine.salas.find(s => s._id.toString() === salaId);
                if (sala) {
                    res.json(sala.funciones || []);
                } else {
                    res.status(404).json({ message: 'Sala no encontrada' });
                }
            } else {
                res.status(404).json({ message: 'Cine o sala no encontrada' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener las funciones', error: error.message });
        }
    });

    route.get('/cines/:cineId/salas/:salaId/funciones/:funcionId', async (req, res) => {
        try {
            const { cineId, salaId, funcionId } = req.params;
            
            const cine = await db.collection('cines').findOne(
                { _id: ObjectId.createFromHexString(cineId) }
            );
            
            if (cine && cine.salas) {
                const sala = cine.salas.find(s => s._id.toString() === salaId);
                if (sala && sala.funciones) {
                    const funcion = sala.funciones.find(f => f._id.toString() === funcionId);
                    if (funcion) {
                        res.json(funcion);
                    } else {
                        res.status(404).json({ message: 'Función no encontrada' });
                    }
                } else {
                    res.status(404).json({ message: 'Sala o funciones no encontradas' });
                }
            } else {
                res.status(404).json({ message: 'Cine o sala no encontrada' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener la función', error: error.message });
        }
    });

    route.post('/cines/:cineId/salas/:salaId/funciones', async (req, res) => {
        try {
            const { cineId, salaId } = req.params;
            const newFuncion = req.body;
            newFuncion._id = new ObjectId(); // Generar un nuevo ID para la función
            
            const result = await db.collection('cines').updateOne(
                { 
                    _id: ObjectId.createFromHexString(cineId),
                    "salas._id": ObjectId.createFromHexString(salaId)
                },
                { $push: { "salas.$.funciones": newFuncion } }
            );
            
            if (result.modifiedCount > 0) {
                res.status(201).json({ message: 'Función agregada exitosamente', id: newFuncion._id });
            } else {
                res.status(404).json({ message: 'Cine o sala no encontrada' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al agregar la función', error: error.message });
        }
    });

    route.delete('/cines/:cineId/salas/:salaId/funciones/:funcionId', async (req, res) => {
        try {
            const { cineId, salaId, funcionId } = req.params;
            
            const result = await db.collection('cines').updateOne(
                { 
                    _id: ObjectId.createFromHexString(cineId),
                    "salas._id": ObjectId.createFromHexString(salaId)
                },
                { $pull: { "salas.$.funciones": { _id: ObjectId.createFromHexString(funcionId) } } }
            );
            
            if (result.modifiedCount > 0) {
                res.json({ message: 'Función eliminada exitosamente' });
            } else {
                res.status(404).json({ message: 'Cine, sala o función no encontrada' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar la función', error: error.message });
        }
    });

    route.put('/cines/:cineId/salas/:salaId/funciones/:funcionId', async (req, res) => {
        try {
            const { cineId, salaId, funcionId } = req.params;
            const updatedFuncion = req.body;
            
            updatedFuncion._id = ObjectId.createFromHexString(funcionId);
            
            const result = await db.collection('cines').updateOne(
                { 
                    _id: ObjectId.createFromHexString(cineId),
                    "salas._id": ObjectId.createFromHexString(salaId),
                    "salas.funciones._id": ObjectId.createFromHexString(funcionId)
                },
                { $set: { "salas.$.funciones.$[elem]": updatedFuncion } },
                { arrayFilters: [{ "elem._id": ObjectId.createFromHexString(funcionId) }] }
            );
            
            if (result.modifiedCount > 0) {
                res.json({ message: 'Función actualizada exitosamente' });
            } else {
                res.status(404).json({ message: 'Cine, sala o función no encontrada' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar la función', error: error.message });
        }
    });

    route.put('/cines/:cineId/salas/:salaId', async (req, res) => {
        try {
            const { cineId, salaId } = req.params;
            const updatedSala = req.body;
            
            updatedSala._id = ObjectId.createFromHexString(salaId);
            
            const result = await db.collection('cines').updateOne(
                { 
                    _id: ObjectId.createFromHexString(cineId),
                    "salas._id": ObjectId.createFromHexString(salaId)
                },
                { $set: { "salas.$": updatedSala } }
            );
            
            if (result.modifiedCount > 0) {
                res.json({ message: 'Sala actualizada exitosamente' });
            } else {
                res.status(404).json({ message: 'Cine o sala no encontrada' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar la sala', error: error.message });
        }
    });

    // Rutas CRUD para Salas
    route.get('/salas', async (req, res) => {
        const salas = await db.collection('salas').find({}).toArray();
        res.json(salas);
    });

    route.post('/salas', async (req, res) => {
        const newSala = req.body;
        const result = await db.collection('salas').insertOne(newSala);
        res.status(201).json({ message: 'Sala agregada exitosamente', id: result.insertedId });
    });

    route.put('/salas/:id', async (req, res) => {
        const updatedSala = req.body;
        const result = await db.collection('salas').updateOne(
            { _id: ObjectId.createFromHexString(req.params.id) },
            { $set: updatedSala }
        );
        if (result.modifiedCount > 0) {
            res.json({ message: 'Sala actualizada exitosamente' });
        } else {
            res.status(404).json({ message: 'Sala no encontrada' });
        }
    });

    route.delete('/salas/:id', async (req, res) => {
        const result = await db.collection('salas').deleteOne({ _id: ObjectId.createFromHexString(req.params.id) });
        if (result.deletedCount > 0) {
            res.json({ message: 'Sala eliminada exitosamente' });
        } else {
            res.status(404).json({ message: 'Sala no encontrada' });
        }
    });

    // Rutas CRUD para Funciones
    route.get('/funciones', async (req, res) => {
        const funciones = await db.collection('funciones').find({}).toArray();
        res.json(funciones);
    });

    route.post('/funciones', async (req, res) => {
        const newFuncion = req.body;
        const result = await db.collection('funciones').insertOne(newFuncion);
        res.status(201).json({ message: 'Función agregada exitosamente', id: result.insertedId });
    });

    route.put('/funciones/:id', async (req, res) => {
        const updatedFuncion = req.body;
        const result = await db.collection('funciones').updateOne(
            { _id: ObjectId.createFromHexString(req.params.id) },
            { $set: updatedFuncion }
        );
        if (result.modifiedCount > 0) {
            res.json({ message: 'Función actualizada exitosamente' });
        } else {
            res.status(404).json({ message: 'Función no encontrada' });
        }
    });

    route.delete('/funciones/:id', async (req, res) => {
        const result = await db.collection('funciones').deleteOne({ _id: ObjectId.createFromHexString(req.params.id) });
        if (result.deletedCount > 0) {
            res.json({ message: 'Función eliminada exitosamente' });
        } else {
            res.status(404).json({ message: 'Función no encontrada' });
        }
    });

    // Rutas CRUD para Películas
    route.get('/peliculas', async (req, res) => {
        try {
            const peliculas = await db.collection('peliculas').find().toArray();
            res.json(peliculas);
        } catch (error) {
            console.error('Error fetching peliculas:', error);
            res.status(500).send('Error fetching peliculas');
        }
    });

    route.post('/peliculas', async (req, res) => {
        try {
            const newMovie = req.body;
            const result = await db.collection('peliculas').insertOne(newMovie);
            res.status(201).json({ message: 'Película agregada exitosamente', id: result.insertedId });
        } catch (error) {
            console.error('Error adding pelicula:', error);
            res.status(500).send('Error adding pelicula');
        }
    });

    route.put('/peliculas/:id', async (req, res) => {
        try {
            const updatedMovie = req.body;
            const result = await db.collection('peliculas').updateOne(
                { _id: ObjectId.createFromHexString(req.params.id) },
                { $set: updatedMovie }
            );
            if (result.modifiedCount > 0) {
                res.json({ message: 'Película actualizada exitosamente' });
            } else {
                res.status(404).json({ message: 'Película no encontrada' });
            }
        } catch (error) {
            console.error('Error updating pelicula:', error);
            res.status(500).send('Error updating pelicula');
        }
    });

    route.delete('/peliculas/:id', async (req, res) => {
        try {
            const result = await db.collection('peliculas').deleteOne({ _id: ObjectId.createFromHexString(req.params.id) });
            if (result.deletedCount > 0) {
                res.json({ message: 'Película eliminada exitosamente' });
            } else {
                res.status(404).json({ message: 'Película no encontrada' });
            }
        } catch (error) {
            console.error('Error deleting pelicula:', error);
            res.status(500).send('Error deleting pelicula');
        }
    });

    // Reporte 1: Funciones disponibles por cine y película (usando ObjectId)
    route.get('/reportes/funciones-disponibles', async (req, res) => {
        try {
            const { cineId, peliculaId } = req.query;
            if (!cineId || !peliculaId) {
                return res.status(400).json({ message: 'cineId y peliculaId son requeridos' });
            }
            const resultados = await reportes.funcionesDisponiblesPorCineYPelicula(cineId, peliculaId);
            res.json(resultados);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // Reporte 2: Películas con funciones vigentes por fecha y cine (usando ObjectId de cine)
    route.get('/reportes/peliculas-vigentes', async (req, res) => {
        try {
            const { fecha, cineId } = req.query;
            if (!fecha || !cineId) {
                return res.status(400).json({ message: 'fecha y cineId son requeridos' });
            }
            const resultados = await reportes.peliculasConFuncionesVigentes(fecha, cineId);
            res.json(resultados);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // Reporte 3: Películas proyectadas por rango de fecha
    route.get('/reportes/peliculas-proyectadas', async (req, res) => {
        try {
            const { fechaInicio, fechaFin } = req.query;
            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({ message: 'fechaInicio y fechaFin son requeridos' });
            }
            const resultados = await reportes.peliculasProyectadasPorRango(fechaInicio, fechaFin);
            res.json(resultados);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    return route;
}
