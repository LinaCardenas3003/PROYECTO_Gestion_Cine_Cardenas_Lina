import { API_URL } from './constants.js';

const path = `${API_URL}`

const sesion = JSON.parse(localStorage.getItem('sesion'));

const headers = {
    'Content-Type': 'application/json',
    'Authorization': sesion?.token
}

export async function post(endPoint, data){
    if(!endPoint.includes('login') && !endPoint.includes('register')){
        if(!sesion){
            alert('Usuario no autenticado.');
            window.location.href='user/login';
        }
    }
    const result = await fetch(`${path}/${endPoint}`,{
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    });

    return await result.json();
}

export async function getAll(endPoint) {
    try {
        const result = await fetch(`${path}/${endPoint}`,{
            method: 'GET',
            headers
        });

        if (!result.ok) {
            throw new Error(`HTTP error! status: ${result.status}`);
        }

        return await result.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw new Error('Error fetching data from the server: ' + error.message);
    }
}

export async function remove(endPoint, id){
    const result = await fetch(`${path}/${endPoint}/${id}`,{
        method: 'DELETE',
        headers
    });

    return await result.json();
}

export async function put(endPoint, id, data) {
    const result = await fetch(`${path}/${endPoint}/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
    });

    return await result.json();
}
