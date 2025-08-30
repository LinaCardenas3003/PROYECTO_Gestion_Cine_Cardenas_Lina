import { post } from './services.js';

const btnEnviar = document.getElementById('enviar');

btnEnviar.addEventListener('click', async ( )=>{
    const txtEmail = document.getElementById('email');
    const txtPassword = document.getElementById('password');
    const form = {
        email: txtEmail.value,
        password: txtPassword.value
    }
    const result = await post('user/login', form);
    if(result.errors || result.message === 'Error') {
        alert(result.error || 'Hubo un error en la autenticación');
    } else {
        localStorage.setItem('sesion', JSON.stringify(result));
        document.location.href = 'dashboard.html';
    }
});

const btnRegister = document.getElementById('registerBtn');
if (btnRegister) {
    btnRegister.addEventListener('click', async () => {
        const id = document.getElementById('id').value;
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('emailRegister').value;
        const position = document.getElementById('position').value;
        const password = document.getElementById('passwordRegister').value;

        const form = {
            id,
            name,
            phone,
            email,
            position,
            password
        };

        const result = await post('user/register', form);
        if (result.message) {
            alert(result.message);
        } else {
            alert('Usuario registrado con éxito');
        }
    });
}
