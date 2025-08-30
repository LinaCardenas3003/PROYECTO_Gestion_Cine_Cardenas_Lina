import { ReportesCine } from './reportes.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function showMenu() {
  console.log('\n=== SISTEMA DE REPORTES CINEMA ===');
  console.log('1. Funciones disponibles por cine y película');
  console.log('2. Películas con funciones vigentes por fecha y cine');
  console.log('3. Películas proyectadas por rango de fecha');
  console.log('4. Salir\n');

  rl.question('Seleccione una opción: ', async (option) => {
    switch (option) {
      case '1':
        await generarReporteFuncionesDisponibles();
        break;
      case '2':
        await generarReportePeliculasVigentes();
        break;
      case '3':
        await generarReporteProyeccionesRango();
        break;
      case '4':
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('Opción inválida.');
        showMenu();
    }
  });
}

async function generarReporteFuncionesDisponibles() {
  try {
    rl.question('Ingrese el ID del cine: ', async (cineId) => {
      rl.question('Ingrese el ID de la película: ', async (peliculaId) => {
        const reportes = new ReportesCine();
        const resultados = await reportes.funcionesDisponiblesPorCineYPelicula(cineId, peliculaId);
        
        if (resultados.length === 0) {
          console.log('No se encontraron funciones disponibles para los criterios especificados.');
        } else {
          console.log('\n=== FUNCIONES DISPONIBLES ===');
          resultados.forEach((funcion, index) => {
            console.log(`${index + 1}. ${funcion.cine} - ${funcion.sala}`);
            console.log(`   Película: ${funcion.pelicula}`);
            console.log(`   Fecha: ${funcion.fecha}`);
            console.log(`   Hora: ${funcion.hora}`);
            console.log(`   Precio: $${funcion.precio}`);
            console.log(`   Asientos disponibles: ${funcion.asientosDisponibles}`);
            console.log('---');
          });

          // Generar archivo CSV
          const rutaArchivo = await reportes.generarReporteCSV('funciones_disponibles', resultados);
          console.log(`\nReporte generado en: ${rutaArchivo}`);
        }
        
        showMenu();
      });
    });
  } catch (error) {
    console.error('Error:', error.message);
    showMenu();
  }
}

async function generarReportePeliculasVigentes() {
  try {
    rl.question('Ingrese la fecha (YYYY-MM-DD): ', async (fecha) => {
      rl.question('Ingrese el ID del cine: ', async (cineId) => {
        const reportes = new ReportesCine();
        const resultados = await reportes.peliculasConFuncionesVigentes(fecha, cineId);
        
        if (resultados.length === 0) {
          console.log('No se encontraron películas con funciones vigentes para los criterios especificados.');
        } else {
          console.log('\n=== PELÍCULAS CON FUNCIONES VIGENTES ===');
          resultados.forEach((pelicula, index) => {
            console.log(`${index + 1}. ${pelicula.pelicula}`);
            console.log(`   Género: ${pelicula.genero}`);
            console.log(`   Duración: ${pelicula.duracion} minutos`);
            console.log('   Funciones:');
            pelicula.funciones.forEach((funcion, funcIndex) => {
              console.log(`     ${funcIndex + 1}. Sala: ${funcion.sala}, Hora: ${funcion.hora}, Precio: $${funcion.precio}`);
            });
            console.log('---');
          });

          // Generar archivo CSV
          const rutaArchivo = await reportes.generarReporteCSV('peliculas_vigentes', resultados);
          console.log(`\nReporte generado en: ${rutaArchivo}`);
        }
        
        showMenu();
      });
    });
  } catch (error) {
    console.error('Error:', error.message);
    showMenu();
  }
}

async function generarReporteProyeccionesRango() {
  try {
    rl.question('Ingrese la fecha de inicio (YYYY-MM-DD): ', async (fechaInicio) => {
      rl.question('Ingrese la fecha de fin (YYYY-MM-DD): ', async (fechaFin) => {
        const reportes = new ReportesCine();
        const resultados = await reportes.peliculasProyectadasPorRango(fechaInicio, fechaFin);
        
        if (resultados.length === 0) {
          console.log('No se encontraron proyecciones para el rango de fechas especificado.');
        } else {
          console.log('\n=== PELÍCULAS PROYECTADAS POR RANGO ===');
          resultados.forEach((cine, index) => {
            console.log(`${index + 1}. ${cine.cine} - ${cine.ciudad}`);
            cine.dias.forEach(dia => {
              console.log(`   Fecha: ${dia.fecha}`);
              dia.peliculas.forEach(pelicula => {
                console.log(`     Película: ${pelicula.pelicula}`);
                console.log(`     Salas destinadas: ${pelicula.salas}`);
                console.log(`     Funciones: ${pelicula.funciones}`);
              });
            });
            console.log('---');
          });

          // Generar archivo CSV
          const rutaArchivo = await reportes.generarReporteCSV('proyecciones_rango', resultados);
          console.log(`\nReporte generado en: ${rutaArchivo}`);
        }
        
        showMenu();
      });
    });
  } catch (error) {
    console.error('Error:', error.message);
    showMenu();
  }
}

async function main() {
  console.log('=== SISTEMA DE REPORTES CINEMA ===');
  showMenu();
}

process.on('SIGINT', () => {
  rl.close();
  process.exit(0);
});

main();
