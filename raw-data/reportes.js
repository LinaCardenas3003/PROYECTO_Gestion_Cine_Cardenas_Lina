import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';

export class ReportesCine {
    constructor() {
        this.uri = 'mongodb://localhost:27017';
        this.dbName = 'cine';
        this.client = new MongoClient(this.uri);
    }

    async connect() {
        await this.client.connect();
        this.db = this.client.db(this.dbName);
    }

    async disconnect() {
        await this.client.close();
    }

    // Endpoint 1: Funciones disponibles por cine y película
    async funcionesDisponiblesPorCineYPelicula(cineId, peliculaId) {
        try {
            await this.connect();
            
            // Obtener el cine por ID
            const cine = await this.db.collection('cines').findOne({ 
                _id: ObjectId.createFromHexString(cineId)
            });

            if (!cine) {
                throw new Error('Cine no encontrado');
            }

            // Obtener la película por ID
            const pelicula = await this.db.collection('peliculas').findOne({ 
                _id: ObjectId.createFromHexString(peliculaId)
            });

            if (!pelicula) {
                throw new Error('Película no encontrada');
            }

            const fechaActual = new Date();
            const funcionesDisponibles = [];

            // Recorrer todas las salas del cine
            for (const sala of cine.salas || []) {
                for (const funcion of sala.funciones || []) {
                    // Verificar si la función es de la película solicitada y está vigente
                    if (funcion.peliculaId === peliculaId && 
                        new Date(funcion.fecha) >= fechaActual) {
                        
                        funcionesDisponibles.push({
                            cine: cine.nombre,
                            sala: sala.nombre,
                            pelicula: pelicula.titulo,
                            fecha: funcion.fecha,
                            hora: funcion.hora,
                            precio: funcion.precio,
                            asientosDisponibles: funcion.asientosDisponibles
                        });
                    }
                }
            }

            return funcionesDisponibles;

        } finally {
            await this.disconnect();
        }
    }

    // Endpoint 2: Películas con funciones vigentes por fecha y cine
    async peliculasConFuncionesVigentes(fecha, cineId) {
        try {
            await this.connect();
            
            // Obtener el cine por ID
            const cine = await this.db.collection('cines').findOne({ 
                _id: ObjectId.createFromHexString(cineId)
            });

            if (!cine) {
                throw new Error('Cine no encontrado');
            }

            const fechaConsulta = new Date(fecha);
            const peliculasMap = new Map();

            // Recorrer todas las salas del cine
            for (const sala of cine.salas || []) {
                for (const funcion of sala.funciones || []) {
                    const funcionFecha = new Date(funcion.fecha);
                    
                    // Verificar si la función es de la fecha solicitada
                    if (funcionFecha.toDateString() === fechaConsulta.toDateString()) {
                        
                        // Obtener información de la película por ID
                        const pelicula = await this.db.collection('peliculas').findOne({ 
                            _id: ObjectId.createFromHexString(funcion.peliculaId)
                        });

                        if (pelicula) {
                            const peliculaKey = pelicula._id.toString();
                            
                            if (!peliculasMap.has(peliculaKey)) {
                                peliculasMap.set(peliculaKey, {
                                    pelicula: pelicula.titulo,
                                    genero: pelicula.genero,
                                    duracion: pelicula.duracion,
                                    funciones: []
                                });
                            }

                            peliculasMap.get(peliculaKey).funciones.push({
                                sala: sala.nombre,
                                hora: funcion.hora,
                                precio: funcion.precio,
                                asientosDisponibles: funcion.asientosDisponibles
                            });
                        }
                    }
                }
            }

            return Array.from(peliculasMap.values());

        } finally {
            await this.disconnect();
        }
    }

    // Endpoint 3: Información de películas proyectadas por rango de fecha
    async peliculasProyectadasPorRango(fechaInicio, fechaFin) {
        try {
            await this.connect();
            
            const fechaInicioConsulta = new Date(fechaInicio);
            const fechaFinConsulta = new Date(fechaFin);
            fechaFinConsulta.setHours(23, 59, 59, 999); // Hasta el final del día

            const resultados = [];

            // Obtener todos los cines
            const cines = await this.db.collection('cines').find().toArray();

            for (const cine of cines) {
                const cineInfo = {
                    cine: cine.nombre,
                    ciudad: cine.ciudad,
                    dias: []
                };

                // Crear un mapa de días dentro del rango
                const diasMap = new Map();
                let currentDate = new Date(fechaInicioConsulta);
                
                while (currentDate <= fechaFinConsulta) {
                    const diaKey = currentDate.toISOString().split('T')[0];
                    diasMap.set(diaKey, {
                        fecha: diaKey,
                        peliculas: new Map()
                    });
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                // Procesar funciones del cine
                for (const sala of cine.salas || []) {
                    for (const funcion of sala.funciones || []) {
                        const funcionFecha = new Date(funcion.fecha);
                        
                        if (funcionFecha >= fechaInicioConsulta && funcionFecha <= fechaFinConsulta) {
                            const diaKey = funcionFecha.toISOString().split('T')[0];
                            const diaInfo = diasMap.get(diaKey);
                            
                            if (diaInfo) {
                                // Obtener información de la película
                                const pelicula = await this.db.collection('peliculas').findOne({ 
                                    _id: ObjectId.createFromHexString(funcion.peliculaId)
                                });

                                if (pelicula) {
                                    const peliculaKey = pelicula._id.toString();
                                    
                                    if (!diaInfo.peliculas.has(peliculaKey)) {
                                        diaInfo.peliculas.set(peliculaKey, {
                                            pelicula: pelicula.titulo,
                                            salas: 0,
                                            funciones: 0
                                        });
                                    }

                                    const peliculaInfo = diaInfo.peliculas.get(peliculaKey);
                                    peliculaInfo.salas += 1;
                                    peliculaInfo.funciones += 1;
                                }
                            }
                        }
                    }
                }

                // Convertir el mapa a array
                for (const [diaKey, diaInfo] of diasMap) {
                    if (Array.from(diaInfo.peliculas.values()).length > 0) {
                        cineInfo.dias.push({
                            fecha: diaInfo.fecha,
                            peliculas: Array.from(diaInfo.peliculas.values())
                        });
                    }
                }

                if (cineInfo.dias.length > 0) {
                    resultados.push(cineInfo);
                }
            }

            return resultados;

        } finally {
            await this.disconnect();
        }
    }

    // Método para generar reportes en archivos CSV
    async generarReporteCSV(nombreReporte, datos) {
        const reportesDir = path.join(process.cwd(), 'reportes');
        
        // Crear directorio de reportes si no existe
        if (!fs.existsSync(reportesDir)) {
            fs.mkdirSync(reportesDir, { recursive: true });
        }

        const fecha = new Date().toISOString().split('T')[0];
        const nombreArchivo = `${nombreReporte}_${fecha}.csv`;
        const rutaArchivo = path.join(reportesDir, nombreArchivo);

        let csvContent = '';

        // Lógica para convertir datos a CSV según el tipo de reporte
        if (nombreReporte === 'funciones_disponibles') {
            csvContent = 'Cine,Sala,Película,Fecha,Hora,Precio,Asientos Disponibles\n';
            datos.forEach(item => {
                csvContent += `"${item.cine}","${item.sala}","${item.pelicula}","${item.fecha}","${item.hora}",${item.precio},${item.asientosDisponibles}\n`;
            });
        } else if (nombreReporte === 'peliculas_vigentes') {
            csvContent = 'Película,Género,Duración,Sala,Hora,Precio,Asientos Disponibles\n';
            datos.forEach(pelicula => {
                pelicula.funciones.forEach(funcion => {
                    csvContent += `"${pelicula.pelicula}","${pelicula.genero}",${pelicula.duracion},"${funcion.sala}","${funcion.hora}",${funcion.precio},${funcion.asientosDisponibles}\n`;
                });
            });
        } else if (nombreReporte === 'proyecciones_rango') {
            csvContent = 'Cine,Ciudad,Fecha,Película,Salas Destinadas,Funciones\n';
            datos.forEach(cine => {
                cine.dias.forEach(dia => {
                    dia.peliculas.forEach(pelicula => {
                        csvContent += `"${cine.cine}","${cine.ciudad}","${dia.fecha}","${pelicula.pelicula}",${pelicula.salas},${pelicula.funciones}\n`;
                    });
                });
            });
        }

        fs.writeFileSync(rutaArchivo, csvContent, 'utf8');
        return rutaArchivo;
    }
}
