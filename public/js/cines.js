import { post, getAll } from './services.js';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('cineForm');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const codigo = document.getElementById('codigo').value;
        const nombre = document.getElementById('nombre').value;
        const direccion = document.getElementById('direccion').value;
        const ciudad = document.getElementById('ciudad').value;

        const cineData = {
            codigo,
            nombre,
            direccion,
            ciudad,
            salas: [] // Inicializar con salas vacías
        };

        try {
            const cines = await getAll('user/cines');
            const existingCine = cines.find(c => c.codigo === codigo);
            
            if (existingCine) {
                alert('Ya existe un cine con ese código');
                return;
            }

            const result = await post('user/cines', cineData);
            
            if (result.id) {
                alert('Cine agregado exitosamente');
                form.reset();
            } else {
                alert('Error al agregar el cine');
            }
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    });
});
