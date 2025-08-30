import { getAll, post, remove, put } from './services.js';

document.addEventListener('DOMContentLoaded', function() {
    const cineGrid = document.getElementById('cine-grid');
    const cineView = document.getElementById('cine-view');
    const adminView = document.getElementById('admin-view');
    const registerView = document.getElementById('register-view');
    const adminList = document.getElementById('admin-list');
    const registerFormContainer = document.getElementById('register-form-container');
    
    const reportsView = document.getElementById('reports-view');
    const reportsBtn = document.getElementById('reportsBtn');
    const backToMainBtn = document.getElementById('backToMainBtn');
    const reportResults = document.getElementById('report-results');
    const reportDataDiv = document.getElementById('report-data');
    const downloadReportBtn = document.getElementById('downloadReport');

    const cineIdFuncionesInput = document.getElementById('cineIdFunciones');
    const peliculaIdFuncionesInput = document.getElementById('peliculaIdFunciones');
    const generateFuncionesReportBtn = document.getElementById('generateFuncionesReport');

    const fechaVigentesInput = document.getElementById('fechaVigentes');
    const cineIdVigentesInput = document.getElementById('cineIdVigentes');
    const generateVigentesReportBtn = document.getElementById('generateVigentesReport');

    const fechaInicioRangoInput = document.getElementById('fechaInicioRango');
    const fechaFinRangoInput = document.getElementById('fechaFinRango');
    const generateRangoReportBtn = document.getElementById('generateRangoReport');
    
    // Cargar cines en el dashboard
    async function loadCines() {
        try {
            const cines = await getAll('user/cines');
            
            // Limpiar grid existente
            cineGrid.innerHTML = '';
            
            // Mostrar cines en cards
            cines.forEach(cine => {
                const card = document.createElement('div');
                card.className = 'cine-card';
                card.innerHTML = `
                    <div class="cine-info">
                        <div class="cine-field">
                            <span class="cine-label">Nombre:</span>
                            <span class="cine-value">${cine.nombre}</span>
                        </div>
                        <div class="cine-field">
                            <span class="cine-label">Ciudad:</span>
                            <span class="cine-value">${cine.ciudad}</span>
                        </div>
                        <div class="cine-field">
                            <span class="cine-label">Dirección:</span>
                            <span class="cine-value">${cine.direccion}</span>
                        </div>
                        <div class="cine-field">
                            <span class="cine-label">Código:</span>
                            <span class="cine-value">${cine.codigo}</span>
                        </div>
                    </div>
                    <div class="cine-actions">
                <button class="btn-success view-salas-btn" data-cine-id="${cine._id}">Ver Salas</button>
                <button class="btn-secondary edit-cine-btn" data-cine-id="${cine._id}">Editar</button>
                <button class="btn-danger delete-cine-btn" data-cine-id="${cine._id}">Eliminar</button>
                    </div>
                `;
                cineGrid.appendChild(card);
            });
            
        } catch (error) {
            console.error('Error al cargar cines:', error);
            if (error.message.includes('fetch')) {
                alert('Error de conexión al cargar la lista de cines. Por favor, verifica tu conexión a internet.');
            } else if (error.message.includes('401') || error.message.includes('403')) {
                alert('Error de autenticación. Por favor, inicia sesión nuevamente.');
                window.location.href = 'index.html';
            } else {
                alert('Error al cargar la lista de cines: ' + error.message);
            }
        }
    }

    // Función para ver salas de un cine
    window.viewSalas = function(cineId) {
        window.location.href = `salas.html?cineId=${cineId}`;
    };

    // Función para editar cine
    window.editCine = function(id) {
        window.location.href = `cinesForm.html?edit=${id}`;
    };

    // Función para eliminar cine
    window.deleteCine = async function(id) {
        if (confirm('¿Está seguro de que desea eliminar este cine?')) {
            try {
                const result = await fetch(`/user/cines/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': JSON.parse(localStorage.getItem('sesion'))?.token
                    }
                });
                
                if (result.ok) {
                    alert('Cine eliminado exitosamente');
                    loadCines();
                } else {
                    alert('Error al eliminar el cine');
                }
            } catch (error) {
                alert('Error de conexión: ' + error.message);
            }
        }
    };

    // Mostrar vista de administrativos
    window.showAdministrativos = function() {
        cineView.style.display = 'none';
        adminView.style.display = 'block';
        registerView.style.display = 'none';
        loadAccounts();
    };

    // Mostrar formulario de registro
    window.showRegisterForm = function() {
        cineView.style.display = 'none';
        adminView.style.display = 'none';
        registerView.style.display = 'block';
        loadRegisterForm();
    };

    // Volver a la lista de administrativos
    window.showAdminList = function() {
        cineView.style.display = 'none';
        adminView.style.display = 'block';
        registerView.style.display = 'none';
        loadAccounts();
    };

    // Cargar lista de administrativos
    async function loadAccounts() {
        try {
            const accounts = await getAll('user'); 
            
            let html = '<table border="1" style="border-collapse: collapse; width: 100%; margin-top: 20px;">';
            html += '<tr><th>Identificación</th><th>Nombre</th><th>Teléfono</th><th>Email</th><th>Cargo</th><th>Acciones</th></tr>';
            
            accounts.forEach(account => {
                // Mostrar la cuenta admin por defecto sin botones de editar/eliminar
                if (account.email === "admin@cineacme.com") {
                    html += `<tr>
                        <td>${account.id || 'N/A'}</td>
                        <td>${account.name || 'Administrador'}</td>
                        <td>${account.phone || 'N/A'}</td>
                        <td>${account.email}</td>
                        <td>${account.position || 'Administrador'}</td>
                        <td>Sin acciones</td>
                    </tr>`;
                } else {
                    // Mostrar otras cuentas con botones de editar/eliminar
                    html += `<tr>
                        <td>${account.id || 'N/A'}</td>
                        <td>${account.name || 'N/A'}</td>
                        <td>${account.phone || 'N/A'}</td>
                        <td>${account.email}</td>
                        <td>${account.position || 'N/A'}</td>
                        <td>
                            <button class="editAccountBtn" data-id="${account._id}">Editar</button>
                            <button class="deleteAccountBtn" data-id="${account._id}">Eliminar</button>
                        </td>
                    </tr>`;
                }
            });
            
            html += '</table>';
            adminList.innerHTML = html;

            // Eventos de edición/eliminación
            document.querySelectorAll('.editAccountBtn').forEach(button => {
                button.addEventListener('click', function() {
                    editAccount(button.dataset.id);
                });
            });

            document.querySelectorAll('.deleteAccountBtn').forEach(button => {
                button.addEventListener('click', function() {
                    deleteAccount(button.dataset.id);
                });
            });
        } catch (error) {
            showMessage('Error al cargar las cuentas: ' + error.message, 'error');
        }
    }

    // Cargar formulario de registro
    function loadRegisterForm() {
        registerFormContainer.innerHTML = `
            <form id="registerForm" style="max-width: 600px; margin: 20px auto;">
                <div style="display: flex; gap: 20px; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <label for="identification">Identificación:</label>
                        <input type="text" id="identification" name="identification" required style="width: 100%; padding: 8px; margin-top: 5px;">
                    </div>
                    <div style="flex: 1;">
                        <label for="name">Nombre Completo:</label>
                        <input type="text" id="name" name="name" required style="width: 100%; padding: 8px; margin-top: 5px;">
                    </div>
                </div>
                
                <div style="display: flex; gap: 20px; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <label for="phone">Teléfono:</label>
                        <input type="tel" id="phone" name="phone" required style="width: 100%; padding: 8px; margin-top: 5px;">
                    </div>
                    <div style="flex: 1;">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" required style="width: 100%; padding: 8px; margin-top: 5px;">
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label for="position">Cargo:</label>
                    <input type="text" id="position" name="position" required style="width: 100%; padding: 8px; margin-top: 5px;">
                </div>
                
                <div style="display: flex; gap: 20px; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <label for="password">Contraseña:</label>
                        <input type="password" id="password" name="password" required style="width: 100%; padding: 8px; margin-top: 5px;">
                    </div>
                    <div style="flex: 1;">
                        <label for="confirmPassword">Confirmar Contraseña:</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" required style="width: 100%; padding: 8px; margin-top: 5px;">
                    </div>
                </div>
                
                <button type="submit" class="btn-primary" style="width: 100%; padding: 12px;">Registrar</button>
            </form>
            <div id="message" style="margin-top: 15px;"></div>
        `;

        const form = document.getElementById('registerForm');
        form.addEventListener('submit', handleRegisterSubmit);
    }

    // Manejar envío del formulario de registro
    async function handleRegisterSubmit(e) {
        e.preventDefault();
        
        const id = document.getElementById('identification').value;
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const position = document.getElementById('position').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validaciones
        if (password !== confirmPassword) {
            showMessage('Las contraseñas no coinciden', 'error');
            return;
        }

        if (password.length < 8) {
            showMessage('La contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }

        const userData = {
            id,
            name,
            phone,
            email,
            position,
            password,
            role: 'admin'
        };

        try {
            const result = await post('user/register', userData);
            if (result.insertedId) {
                alert('Administrativo registrado exitosamente');
                document.getElementById('registerForm').reset();
                setTimeout(() => {
                    showAdminList();
                }, 2000);
            } else {
                alert('Error al registrar el administrativo');
            }
        } catch (error) {
            showMessage('Error de conexión: ' + error.message, 'error');
        }
    }

    // Función para editar cuenta
    async function editAccount(id) {
        try {
            // Primero mostrar el formulario de registro
            showRegisterForm();
            
            // Esperar un momento para que el DOM se actualice
            setTimeout(async () => {
                const accounts = await getAll('user');
                const account = accounts.find(acc => acc._id === id);
                
                if (account) {
                    document.getElementById('identification').value = account.id;
                    document.getElementById('name').value = account.name;
                    document.getElementById('phone').value = account.phone;
                    document.getElementById('email').value = account.email;
                    document.getElementById('position').value = account.position;
                    
                    const submitButton = document.querySelector('#registerForm button[type="submit"]');
                    submitButton.textContent = 'Actualizar';
                    submitButton.onclick = async function(e) {
                        e.preventDefault();
                        
                        const updatedData = {
                            id: document.getElementById('identification').value,
                            name: document.getElementById('name').value,
                            phone: document.getElementById('phone').value,
                            email: document.getElementById('email').value,
                            position: document.getElementById('position').value
                        };
                        
                        try {
                            const result = await put('user', id, updatedData);
                            if (result.message && result.message.includes('éxito')) {
                                showMessage('Administrativo actualizado exitosamente', 'success');
                                document.getElementById('registerForm').reset();
                                submitButton.textContent = 'Registrar';
                                submitButton.onclick = null; // Restaurar el evento original
                                loadAccounts(); // Recargar la lista de cuentas
                            } else {
                                showMessage(result.message || 'Error al actualizar el administrativo', 'error');
                            }
                        } catch (error) {
                            showMessage('Error de conexión: ' + error.message, 'error');
                        }
                    };
                }
            }, 100);
        } catch (error) {
            showMessage('Error al obtener los datos del administrativo: ' + error.message, 'error');
        }
    }

    // Función para eliminar cuenta
    async function deleteAccount(id) {
        if (confirm('¿Está seguro de que desea eliminar este administrativo?')) {
            try {
                const result = await remove('user', id);
                if (result.message) {
                    showMessage(result.message, 'success');
                    loadAccounts();
                } else {
                    showMessage('Error al eliminar el administrativo', 'error');
                }
            } catch (error) {
                showMessage('Error de conexión: ' + error.message, 'error');
            }
        }
    }

    // Función para mostrar mensajes
    function showMessage(message, type) {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = message;
        messageDiv.style.color = type === 'error' ? 'red' : 'green';
        messageDiv.style.marginTop = '10px';
        
        setTimeout(() => {
            messageDiv.textContent = '';
        }, 5000);
    }

    if (reportsBtn) {
        reportsBtn.addEventListener('click', () => {
            cineView.style.display = 'none';
            adminView.style.display = 'none';
            registerView.style.display = 'none';
            reportsView.style.display = 'block';
            reportResults.style.display = 'none';
            reportDataDiv.innerHTML = '';
        });
    }

    if (backToMainBtn) {
        backToMainBtn.addEventListener('click', () => {
            reportsView.style.display = 'none';
            cineView.style.display = 'block';
            adminView.style.display = 'none';
            registerView.style.display = 'none';
            reportResults.style.display = 'none';
            reportDataDiv.innerHTML = '';
        });
    }

    function createTableFromData(data) {
        if (!data || data.length === 0) {
            return '<p>No hay datos para mostrar.</p>';
        }

        let table = '<table class="report-table"><thead><tr>';
        const headers = Object.keys(data[0]);
        headers.forEach(header => {
            table += `<th>${header}</th>`;
        });
        table += '</tr></thead><tbody>';

        data.forEach(row => {
            table += '<tr>';
            headers.forEach(header => {
                table += `<td>${row[header] !== undefined ? row[header] : ''}</td>`;
            });
            table += '</tr>';
        });

        table += '</tbody></table>';
        return table;
    }

    function showReportResults(data) {
        console.log('Report data received:', data);
        if (!data || data.length === 0) {
            console.log('No data to display');
            reportDataDiv.innerHTML = '<p>No hay datos para mostrar.</p>';
        } else {
            console.log('Creating table with data length:', data.length);
            reportDataDiv.innerHTML = createTableFromData(data);
        }
        reportResults.style.display = 'block';
        console.log('Report results should be visible now');
    }

    function downloadCSV(filename, csvContent) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // Fetch and display funciones disponibles report
    if (generateFuncionesReportBtn) {
        generateFuncionesReportBtn.addEventListener('click', async () => {
            const cineId = cineIdFuncionesInput.value.trim();
            const peliculaId = peliculaIdFuncionesInput.value.trim();

            if (!cineId || !peliculaId) {
                alert('Por favor, ingrese el ID del cine y de la película.');
                return;
            }

            try {
                const response = await fetch(`/user/reportes/funciones-disponibles?cineId=${encodeURIComponent(cineId)}&peliculaId=${encodeURIComponent(peliculaId)}`, {
                    headers: {
                        'Authorization': JSON.parse(localStorage.getItem('sesion'))?.token
                    }
                });
                if (!response.ok) {
                    throw new Error('Error al obtener el reporte');
                }
                const data = await response.json();
                showReportResults(data);
                downloadReportBtn.dataset.csv = generateCSVFromFunciones(data);
                alert('Reporte generado con éxito.');
            } catch (error) {
                alert('Error al obtener el reporte: ' + error.message);
            }
        });
    }

    if (generateVigentesReportBtn) {
        generateVigentesReportBtn.addEventListener('click', async () => {
            const fecha = fechaVigentesInput.value;
            const cineId = cineIdVigentesInput.value.trim();

            if (!fecha || !cineId) {
                alert('Por favor, ingrese la fecha y el ID del cine.');
                return;
            }

            try {
                const response = await fetch(`/user/reportes/peliculas-vigentes?fecha=${encodeURIComponent(fecha)}&cineId=${encodeURIComponent(cineId)}`, {
                    headers: {
                        'Authorization': JSON.parse(localStorage.getItem('sesion'))?.token
                    }
                });
                if (!response.ok) {
                    throw new Error('Error al obtener el reporte');
                }
                const data = await response.json();
                const flatData = [];
                data.forEach(pelicula => {
                    pelicula.funciones.forEach(funcion => {
                        flatData.push({
                            Película: pelicula.pelicula,
                            Género: pelicula.genero,
                            Duración: pelicula.duracion,
                            Sala: funcion.sala,
                            Hora: funcion.hora,
                            Precio: funcion.precio,
                            'Asientos Disponibles': funcion.asientosDisponibles
                        });
                    });
                });
                showReportResults(flatData);
                downloadReportBtn.dataset.csv = generateCSVFromPeliculas(flatData);
                alert('Reporte generado con éxito.');
            } catch (error) {
                alert('Error al obtener el reporte: ' + error.message);
            }
        });
    }

    if (generateRangoReportBtn) {
        generateRangoReportBtn.addEventListener('click', async () => {
            const fechaInicio = fechaInicioRangoInput.value;
            const fechaFin = fechaFinRangoInput.value;

            if (!fechaInicio || !fechaFin) {
                alert('Por favor, ingrese la fecha de inicio y la fecha de fin.');
                return;
            }

            try {
                const response = await fetch(`/user/reportes/peliculas-proyectadas?fechaInicio=${encodeURIComponent(fechaInicio)}&fechaFin=${encodeURIComponent(fechaFin)}`, {
                    headers: {
                        'Authorization': JSON.parse(localStorage.getItem('sesion'))?.token
                    }
                });
                if (!response.ok) {
                    throw new Error('Error al obtener el reporte');
                }
                const data = await response.json();
                const flatData = [];
                data.forEach(cine => {
                    cine.dias.forEach(dia => {
                        dia.peliculas.forEach(pelicula => {
                            flatData.push({
                                Cine: cine.cine,
                                Ciudad: cine.ciudad,
                                Fecha: dia.fecha,
                                Película: pelicula.pelicula,
                                'Salas Destinadas': pelicula.salas,
                                Funciones: pelicula.funciones
                            });
                        });
                    });
                });
                showReportResults(flatData);
                downloadReportBtn.dataset.csv = generateCSVFromProyecciones(flatData);
                alert('Reporte generado con éxito.');
            } catch (error) {
                alert('Error al obtener el reporte: ' + error.message);
            }
        });
    }

    function generateCSVFromFunciones(data) {
        let csv = 'Cine,Sala,Película,Fecha,Hora,Precio,Asientos Disponibles\n';
        data.forEach(item => {
            csv += `"${item.cine}","${item.sala}","${item.pelicula}","${item.fecha}","${item.hora}",${item.precio},${item.asientosDisponibles}\n`;
        });
        return csv;
    }

    function generateCSVFromPeliculas(data) {
        let csv = 'Película,Género,Duración,Sala,Hora,Precio,Asientos Disponibles\n';
        data.forEach(item => {
            csv += `"${item.Película}","${item.Género}",${item.Duración},"${item.Sala}","${item.Hora}",${item.Precio},${item['Asientos Disponibles']}\n`;
        });
        return csv;
    }

    function generateCSVFromProyecciones(data) {
        let csv = 'Cine,Ciudad,Fecha,Película,Salas Destinadas,Funciones\n';
        data.forEach(item => {
            csv += `"${item.Cine}","${item.Ciudad}","${item.Fecha}","${item.Película}",${item['Salas Destinadas']},${item.Funciones}\n`;
        });
        return csv;
    }

    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', () => {
            const csvContent = downloadReportBtn.dataset.csv;
            if (!csvContent) {
                alert('No hay datos para descargar.');
                return;
            }
            const filename = 'reporte.csv';
            downloadCSV(filename, csvContent);
        });
    }

    const logoutButton = document.getElementById('logoutButton');
    const adminBtn = document.getElementById('adminBtn');
    const addCineBtn = document.getElementById('addCineBtn');
    const addPeliculaBtn = document.getElementById('addPeliculaBtn');
    const registerAdminBtn = document.getElementById('registerAdminBtn');
    const backToListBtn = document.getElementById('backToListBtn');

    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }

    if (adminBtn) {
        adminBtn.addEventListener('click', function() {
            showAdministrativos();
        });
    }

    if (addCineBtn) {
        addCineBtn.addEventListener('click', function() {
            window.location.href = 'cinesForm.html';
        });
    }

    if (addPeliculaBtn) {
        addPeliculaBtn.addEventListener('click', function() {
            window.location.href = 'peliculasForm.html';
        });
    }

    if (registerAdminBtn) {
        registerAdminBtn.addEventListener('click', function() {
            showRegisterForm();
        });
    }

    if (backToListBtn) {
        backToListBtn.addEventListener('click', function() {
            showAdminList();
        });
    }

    // Event listeners para botones de cines
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-salas-btn')) {
            const cineId = e.target.dataset.cineId;
            window.viewSalas(cineId);
        } else if (e.target.classList.contains('edit-cine-btn')) {
            const cineId = e.target.dataset.cineId;
            window.editCine(cineId);
        } else if (e.target.classList.contains('delete-cine-btn')) {
            const cineId = e.target.dataset.cineId;
            window.deleteCine(cineId);
        }
    });

    // Cargar cines al iniciar
    loadCines();
});
