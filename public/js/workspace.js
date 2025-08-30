import { getAll, remove } from './services.js';

function logout() {
    localStorage.removeItem('sesion');
    window.location.href = 'index.html';
}

async function getAllUsers() {
    const users = await getAll('user');
    let tableContent = users.reduce(( acum, dat)=>{
        return acum += `<tr>
                            <td>${dat.name}</td>
                            <td>${dat.phone}</td>
                            <td>${dat.email}</td>
                            <td><input type="button" value="-" class="btnDelete" regid="${dat._id}"></input></td>
                        </tr>`
    }, '');
    const table = document.getElementById('table-content');
    table.innerHTML = tableContent;

    const btnDelete = document.querySelectorAll('.btnDelete');
    btnDelete.forEach( btn =>{
        btn.addEventListener('click', async (event)=>{
            const id = event.target.getAttribute('regid');
            await deleteUser(id);
        })
    });
}

async function deleteUser(id) {
    const result = await remove('user', id);
    getAllUsers();
}

getAllUsers();