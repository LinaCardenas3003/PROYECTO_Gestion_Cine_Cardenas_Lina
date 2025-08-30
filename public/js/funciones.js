import { getAll, post, remove, put } from './services.js';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('funcionForm');
    const funcionList = document.getElementById('funcionList');
    const salaInfo = document.getElementById('salaInfo');
    const peliculaSelect = document.getElementById('pelicula');
    
    // Obtener IDs de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const cineId = urlParams.get('cineId');
    const salaId = urlParams.get('salaId');

    if (!cineId || !salaId) {
        alert('No se han especificado el cine y la sala');
        window.location.href = 'cines.html';
        return;
    }

    // Cargar información de la sala
    async function loadSalaInfo() {
        try {
            const cine = await getAll(`user/cines/${cineId}`);
            const sala = cine.salas.find(s => s._id === salaId);
            
            if (sala) {
                salaInfo.innerHTML = `
                    <h3>Cine: ${cine.nombre} - Sala: ${sala.codigo}</h3>
                    <p>Capacidad: ${sala.numeroSillas} sillas</p>
                `;
            }
        } catch (error) {
            alert('Error al cargar información de la sala: ' + error.message);
        }
    }

    // Cargar películas para el selector
    async function loadPeliculas() {
        try {
            const peliculas = await getAll('user/peliculas');
            
            // Limpiar selector
            peliculaSelect.innerHTML = '<option value="">Seleccionar película...</option>';
            
            // Agregar películas al selector
            peliculas.forEach(pelicula => {
                const option = document.createElement('option');
                option.value = pelicula._id;
                option.textContent = `${pelicula.titulo} (${pelicula.genero})`;
                peliculaSelect.appendChild(option);
            });
        } catch (error) {
            alert('Error al cargar las películas: ' + error.message);
        }
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;
        const peliculaId = document.getElementById('pelicula').value;
        const precio = document.getElementById('precio').value;

        const funcionData = {
            fecha,
            hora,
            peliculaId,
            precio: parseFloat(precio)
        };

        try {
            const result = await post(`user/cines/${cineId}/salas/${salaId}/funciones`, funcionData);
            
            if (result.id) {
                alert('Función agregada exitosamente');
                form.reset();
                loadFunciones();
            } else {
                alert('Error al agregar la función');
            }
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    });

    async function loadFunciones() {
        try {
            const cine = await getAll(`user/cines/${cineId}`);
            const sala = cine.salas.find(s => s._id === salaId);
            
            if (!sala || !sala.funciones) {
                funcionList.innerHTML = '<p>No hay funciones programadas para esta sala.</p>';
                return;
            }

            let html = '';
            
            // Cargar información de películas para mostrar nombres y pósters
            const peliculas = await getAll('user/peliculas');
            const peliculasMap = {};
            peliculas.forEach(p => peliculasMap[p._id] = p);

            sala.funciones.forEach(funcion => {
                const pelicula = peliculasMap[funcion.peliculaId] || { 
                    titulo: 'Película no encontrada', 
                    poster: '' 
                };
                
                html += `
                <div class="funcion-item">
                    <img src="${pelicula.poster || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA2MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjMwIiB5PSI0MCIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIuZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTIiPk5vIGltYWdlbjwvdGV4dD4KPC9zdmc+'}" 
                         alt="${pelicula.titulo}" 
                         class="funcion-poster">
                    <div class="funcion-info">
                        <h4>${pelicula.titulo}</h4>
                        <p><strong>Fecha:</strong> ${funcion.fecha}</p>
                        <p><strong>Hora:</strong> ${funcion.hora}</p>
                        <p><strong>Precio:</strong> $${funcion.precio.toFixed(2)}</p>
                    </div>
                    <div class="funcion-actions">
                        <button class="edit-btn" onclick="editFuncion('${funcion._id}')">Editar</button>
                        <button class="delete-btn" onclick="deleteFuncion('${funcion._id}')">Eliminar</button>
                    </div>
                </div>
                `;
            });
            
            if (sala.funciones.length === 0) {
                html = '<p>No hay funciones programadas para esta sala.</p>';
            }
            
            funcionList.innerHTML = html;
        } catch (error) {
            alert('Error al cargar las funciones: ' + error.message);
        }
    }

    window.editFuncion = async function(id) {
        try {
            const cine = await getAll(`user/cines/${cineId}`);
            const sala = cine.salas.find(s => s._id === salaId);
            if (!sala || !sala.funciones) {
                alert('No se encontró la función para editar');
                return;
            }
            const funcion = sala.funciones.find(f => f._id === id);
            if (!funcion) {
                alert('Función no encontrada');
                return;
            }

            // Mostrar modal con los datos actuales
            const modal = document.getElementById('editFuncionModal');
            const fechaInput = document.getElementById('editFecha');
            const horaInput = document.getElementById('editHora');
            const peliculaSelect = document.getElementById('editPelicula');
            const precioInput = document.getElementById('editPrecio');
            const errorDiv = document.getElementById('editError');
            
            // Llenar formulario con datos actuales
            fechaInput.value = funcion.fecha;
            horaInput.value = funcion.hora;
            precioInput.value = funcion.precio;
            
            // Cargar películas en el selector del modal
            const peliculas = await getAll('user/peliculas');
            peliculaSelect.innerHTML = '<option value="">Seleccionar película...</option>';
            peliculas.forEach(pelicula => {
                const option = document.createElement('option');
                option.value = pelicula._id;
                option.textContent = `${pelicula.titulo} (${pelicula.genero})`;
                if (pelicula._id === funcion.peliculaId) {
                    option.selected = true;
                }
                peliculaSelect.appendChild(option);
            });
            
            errorDiv.style.display = 'none';
            
            // Mostrar modal
            modal.style.display = 'flex';
            
            // Guardar ID de función para usar en el guardado
            modal.dataset.funcionId = id;
            modal.dataset.cineData = JSON.stringify(cine);
            
        } catch (error) {
            alert('Error al cargar la función para editar: ' + error.message);
        }
    };

    window.deleteFuncion = async function(id) {
        if (confirm('¿Está seguro de que desea eliminar esta función?')) {
            try {
                const result = await remove(`user/cines/${cineId}/salas/${salaId}/funciones`, id);
                if (result.message && result.message.includes('exitosamente')) {
                    alert('Función eliminada exitosamente');
                    loadFunciones();
                } else {
                    alert('Error al eliminar la función');
                }
            } catch (error) {
                alert('Error de conexión: ' + error.message);
            }
        }
    };

    // Event listeners para el modal
    const modal = document.getElementById('editFuncionModal');
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
        const funcionId = modal.dataset.funcionId;
        const cine = JSON.parse(modal.dataset.cineData);
        const fechaInput = document.getElementById('editFecha');
        const horaInput = document.getElementById('editHora');
        const peliculaSelect = document.getElementById('editPelicula');
        const precioInput = document.getElementById('editPrecio');
        
        const nuevaFecha = fechaInput.value.trim();
        const nuevaHora = horaInput.value.trim();
        const nuevaPeliculaId = peliculaSelect.value;
        const nuevoPrecio = precioInput.value.trim();

        // Validaciones
        if (!nuevaFecha) {
            showError('La fecha es requerida');
            return;
        }

        if (!nuevaHora) {
            showError('La hora es requerida');
            return;
        }

        if (!nuevaPeliculaId) {
            showError('Debe seleccionar una película');
            return;
        }

        if (!nuevoPrecio || isNaN(nuevoPrecio) || parseFloat(nuevoPrecio) <= 0) {
            showError('El precio debe ser un número válido mayor a 0');
            return;
        }

        try {
            // Actualizar función
            const funcionData = {
                fecha: nuevaFecha,
                hora: nuevaHora,
                peliculaId: nuevaPeliculaId,
                precio: parseFloat(nuevoPrecio)
            };

            const result = await put(`user/cines/${cineId}/salas/${salaId}/funciones`, funcionId, funcionData);
            
            if (result.message && result.message.includes('actualizada')) {
                alert('Función actualizada exitosamente');
                modal.style.display = 'none';
                loadFunciones();
            } else {
                showError('Error al actualizar la función');
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

    // Event listener para el botón de volver
    const backButton = document.getElementById('backButton');
    backButton.addEventListener('click', function() {
        const urlParams = new URLSearchParams(window.location.search);
        const cineId = urlParams.get('cineId');
        window.location.href = `salas.html?cineId=${cineId}`;
    });

    // Cargar información al iniciar
    loadSalaInfo();
    loadPeliculas();
    loadFunciones();
});
