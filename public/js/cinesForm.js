import { post, put, getAll } from './services.js';

document.addEventListener('DOMContentLoaded', function() {
    const cineForm = document.getElementById('cineForm');
    const urlParams = new URLSearchParams(window.location.search);
    const editMode = urlParams.has('edit');
    const cineId = urlParams.get('edit');
    let isEditing = false;

    const formTitle = document.getElementById('form-title');
    const submitButton = document.getElementById('submit-button');

    const cancelButton = document.getElementById('cancel-button');
    
    if (editMode) {
        formTitle.textContent = 'Editar Cine';
        submitButton.textContent = 'Actualizar Cine';
        cancelButton.style.display = 'inline-block';
        isEditing = true;
        loadCineData(cineId);
    }

    cancelButton.addEventListener('click', function() {
        if (confirm('¿Está seguro de que desea cancelar la edición?')) {
            window.location.href = 'dashboard.html';
        }
    });

    cineForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const codigo = document.getElementById('codigo').value;
        const nombre = document.getElementById('nombre').value;
        const direccion = document.getElementById('direccion').value;
        const ciudad = document.getElementById('ciudad').value;

        const cineData = {
            codigo: codigo,
            nombre: nombre,
            direccion: direccion,
            ciudad: ciudad,
            salas: [] 
        };

        try {
            const cines = await getAll('user/cines');
            const existingCine = cines.find(c => c.codigo === codigo);
            
            if (existingCine) {
                if (isEditing && cineId) {
                    if (existingCine._id !== cineId) {
                        alert('Ya existe un cine con ese código');
                        return;
                    }
                } else {
                    alert('Ya existe un cine con ese código');
                    return;
                }
            }

            let response;
            if (isEditing && cineId) {
                response = await put('user/cines', cineId, cineData);
            } else {
                response = await post('user/cines', cineData);
            }

            if (response.message || response.id) {
                alert(isEditing ? 'Cine actualizado exitosamente' : 'Cine agregado exitosamente');
                window.location.href = 'dashboard.html';
            } else {
                alert(isEditing ? 'Error al actualizar el cine' : 'Error al agregar el cine');
            }
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    });

    async function loadCineData(id) {
        try {
            const cines = await getAll('user/cines');
            const cine = cines.find(c => c._id === id);

            if (cine) {
                document.getElementById('codigo').value = cine.codigo || '';
                document.getElementById('nombre').value = cine.nombre || '';
                document.getElementById('direccion').value = cine.direccion || '';
                document.getElementById('ciudad').value = cine.ciudad || '';
            } else {
                alert('Cine no encontrado');
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            alert('Error al cargar datos del cine: ' + error.message);
            window.location.href = 'dashboard.html';
        }
    }
});
