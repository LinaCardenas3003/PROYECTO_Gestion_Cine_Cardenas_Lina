import { post, remove, getAll, put } from './services.js';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');
    const accountList = document.getElementById('accountList');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Verificar si el token de autenticación está presente
        const sesion = JSON.parse(localStorage.getItem('sesion'));
        console.log('Sesión:', sesion);
        
        const id = document.getElementById('identification').value;
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const position = document.getElementById('position').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Mostrar valores para depuración
        console.log('Valores del formulario:');
        console.log('ID:', id, 'Tipo:', typeof id);
        console.log('Nombre:', name, 'Tipo:', typeof name);
        console.log('Teléfono:', phone, 'Tipo:', typeof phone);
        console.log('Email:', email, 'Tipo:', typeof email);
        console.log('Cargo:', position, 'Tipo:', typeof position);
        console.log('Contraseña:', password, 'Tipo:', typeof password);
        console.log('Confirmar contraseña:', confirmPassword, 'Tipo:', typeof confirmPassword);

        // Verificar si los campos están vacíos
        if (!id) {
            showMessage('El campo identificación es obligatorio', 'error');
            return;
        }
        
        if (!name) {
            showMessage('El campo nombre es obligatorio', 'error');
            return;
        }
        
        if (!phone) {
            showMessage('El campo teléfono es obligatorio', 'error');
            return;
        }
        
        if (!email) {
            showMessage('El campo email es obligatorio', 'error');
            return;
        }
        
        if (!position) {
            showMessage('El campo cargo es obligatorio', 'error');
            return;
        }
        
        if (!password) {
            showMessage('El campo contraseña es obligatorio', 'error');
            return;
        }
        
        if (!confirmPassword) {
            showMessage('El campo confirmar contraseña es obligatorio', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Las contraseñas no coinciden', 'error');
            return;
        }

        if (password.length < 8) {
            showMessage('La contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }

        // Validaciones adicionales antes de enviar los datos
        if (id.length < 3) {
            showMessage('La identificación debe tener al menos 3 caracteres', 'error');
            return;
        }
        
        if (name.length < 2) {
            showMessage('El nombre debe tener al menos 2 caracteres', 'error');
            return;
        }
        
        // Validar formato de teléfono colombiano
        const phoneRegex = /^(\+57|57)?3\d{9}$/;
        if (!phoneRegex.test(phone)) {
            showMessage('El número telefónico debe ser válido según el formato de Colombia', 'error');
            return;
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('El email debe ser válido', 'error');
            return;
        }
        
        if (position.length < 2) {
            showMessage('El cargo debe tener al menos 2 caracteres', 'error');
            return;
        }
        
        // Validar contraseña fuerte
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            showMessage('La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales', 'error');
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
            console.log('Enviando datos al servidor:', userData); 
            const result = await post('user/register', userData);
            console.log('Resultado del registro:', result); 
            if (result.insertedId) {
                alert('Administrativo registrado exitosamente');
                form.reset();
                loadAccounts();
            } else {
                showMessage('Error al registrar el administrativo', 'error');
            }
        } catch (error) {
            console.error('Error al registrar el administrativo:', error); 
            showMessage('Error de conexión: ' + error.message, 'error');
        }
    });

    async function loadAccounts() {
    try {
        const accounts = await getAll('user'); 
        console.log('Retrieved accounts:', accounts); 
        
        let html = '<table border="1" style="border-collapse: collapse; width: 100%;">';
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
        accountList.innerHTML = html;

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

async function editAccount(id) {
    try {
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
                loadAccounts(); // Recargar la lista de cuentas
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
    messageDiv.className = `message ${type}`;
    
    // Limpiar el mensaje después de 5 segundos
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }, 5000);
}

loadAccounts();

});
