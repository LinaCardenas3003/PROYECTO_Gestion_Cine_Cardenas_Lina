import { getAll, post, remove, put } from './services.js';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('salaForm');
    const salaList = document.getElementById('salaList');
    const cineInfo = document.getElementById('cineInfo');
    
    // Obtener el ID del cine de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const cineId = urlParams.get('cineId');

    if (!cineId) {
        alert('No se ha especificado un cine');
        window.location.href = 'cines.html';
        return;
    }

    // Cargar información del cine
    async function loadCineInfo() {
        try {
            const cine = await getAll(`user/cines/${cineId}`);
            cineInfo.innerHTML = `<h3>Cine: ${cine.nombre} (${cine.codigo})</h3>
                                 <p>Dirección: ${cine.direccion}, ${cine.ciudad}</p>`;
        } catch (error) {
            alert('Error al cargar información del cine: ' + error.message);
        }
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const codigo = document.getElementById('codigo').value;
        const numeroSillas = document.getElementById('numeroSillas').value;

        const salaData = {
            codigo,
            numeroSillas: parseInt(numeroSillas),
            funciones: [] // Inicializar con funciones vacías
        };

        try {
            // Primero verificar si ya existe una sala con el mismo código en este cine
            const cine = await getAll(`user/cines/${cineId}`);
            const salaExistente = cine.salas.find(sala => sala.codigo === codigo);
            
            if (salaExistente) {
                alert('Ya existe una sala con este código en este cine');
                return;
            }

            // Agregar sala al cine
            const result = await post(`user/cines/${cineId}/salas`, salaData);
            
            if (result.id) {
                alert('Sala agregada exitosamente');
                form.reset();
                loadSalas();
            } else {
                alert('Error al agregar la sala');
            }
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    });

    async function loadSalas() {
        try {
            const cine = await getAll(`user/cines/${cineId}`);
            let html = '<h3>Lista de Salas</h3><table border="1" style="border-collapse: collapse; width: 100%;">';
            html += '<tr><th>Código</th><th>Número de Sillas</th><th>Acciones</th></tr>';
            
            cine.salas.forEach(sala => {
                html += `<tr>
                    <td>${sala.codigo}</td>
                    <td>${sala.numeroSillas}</td>
                    <td>
                        <button onclick="editSala('${sala._id}')" class="btn-secondary">Editar</button>
                        <button onclick="deleteSala('${sala._id}')" class="btn-danger">Eliminar</button>
                        <button onclick="viewFunciones('${sala._id}')" class="btn-white">Ver Funciones</button>
                    </td>
                </tr>`;
            });
            
            html += '</table>';
            salaList.innerHTML = html;
        } catch (error) {
            alert('Error al cargar las salas: ' + error.message);
        }
    }

    window.editSala = async function(id) {
        try {
            // Obtener información del cine y la sala
            const cine = await getAll(`user/cines/${cineId}`);
            const sala = cine.salas.find(s => s._id === id);
            
            if (!sala) {
                alert('Sala no encontrada');
                return;
            }

            // Mostrar modal con los datos actuales
            const modal = document.getElementById('editSalaModal');
            const codigoInput = document.getElementById('editCodigo');
            const sillasInput = document.getElementById('editNumeroSillas');
            const errorDiv = document.getElementById('editError');
            
            // Llenar formulario con datos actuales
            codigoInput.value = sala.codigo;
            sillasInput.value = sala.numeroSillas;
            errorDiv.style.display = 'none';
            
            // Mostrar modal
            modal.style.display = 'flex';
            
            // Guardar ID de sala para usar en el guardado
            modal.dataset.salaId = id;
            modal.dataset.cineData = JSON.stringify(cine);
            
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    };

    window.deleteSala = async function(id) {
        if (confirm('¿Está seguro de que desea eliminar esta sala?')) {
            try {
                const result = await remove(`user/cines/${cineId}/salas`, id);
                if (result.message && result.message.includes('exitosamente')) {
                    alert('Sala eliminada exitosamente');
                    loadSalas();
                } else {
                    alert('Error al eliminar la sala');
                }
            } catch (error) {
                alert('Error de conexión: ' + error.message);
            }
        }
    };

    window.viewFunciones = function(salaId) {
        // Redirigir a la página de funciones con el ID de la sala
        window.location.href = `funciones.html?cineId=${cineId}&salaId=${salaId}`;
    };

    // Event listeners para el modal
    const modal = document.getElementById('editSalaModal');
    const closeModal = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancelEdit');
    const saveBtn = document.getElementById('saveEdit');
    const errorDiv = document.getElementById('editError');

    // Cerrar modal al hacer clic en la X
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Cerrar modal al hacer clic en Cancelar
    cancelBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Guardar cambios
    saveBtn.addEventListener('click', async function() {
        const salaId = modal.dataset.salaId;
        const cine = JSON.parse(modal.dataset.cineData);
        const codigoInput = document.getElementById('editCodigo');
        const sillasInput = document.getElementById('editNumeroSillas');
        
        const nuevoCodigo = codigoInput.value.trim();
        const nuevoNumeroSillas = sillasInput.value.trim();

        // Validaciones
        if (!nuevoCodigo) {
            showError('El código de la sala es requerido');
            return;
        }

        if (!nuevoNumeroSillas || isNaN(nuevoNumeroSillas) || parseInt(nuevoNumeroSillas) <= 0) {
            showError('El número de sillas debe ser un número válido mayor a 0');
            return;
        }

        // Validar que el nuevo código no exista en otras salas del mismo cine
        const codigoExistente = cine.salas.find(s => 
            s.codigo === nuevoCodigo && s._id !== salaId
        );
        
        if (codigoExistente) {
            showError('Ya existe una sala con este código en este cine');
            return;
        }

        try {
            // Actualizar sala
            const salaData = {
                codigo: nuevoCodigo,
                numeroSillas: parseInt(nuevoNumeroSillas)
            };

            const result = await put(`user/cines/${cineId}/salas`, salaId, salaData);
            
            if (result.message && result.message.includes('exitosamente')) {
                alert('Sala actualizada exitosamente');
                modal.style.display = 'none';
                loadSalas();
            } else {
                showError('Error al actualizar la sala');
            }
        } catch (error) {
            showError('Error de conexión: ' + error.message);
        }
    });

    // Cerrar modal al hacer clic fuera del contenido
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    // Cargar información del cine y salas al iniciar
    loadCineInfo();
    loadSalas();
});
