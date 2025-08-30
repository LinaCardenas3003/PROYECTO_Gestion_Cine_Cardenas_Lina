import { post, put, getAll } from './services.js';

document.addEventListener('DOMContentLoaded', function() {
    const peliculaForm = document.getElementById('peliculaForm');
    const urlParams = new URLSearchParams(window.location.search);
    const editMode = urlParams.has('edit');
    const movieId = urlParams.get('edit');
    let isEditing = false;

    if (editMode) {
        document.querySelector('h3').textContent = 'Editar Película';
        document.querySelector('button[type="submit"]').textContent = 'Actualizar Película';
        isEditing = true;
    }

    if (isEditing && movieId) {
        loadMovieData(movieId);
    }

    peliculaForm.addEventListener('submit', async function(event) {
        event.preventDefault(); 
        const movieData = {
            codigo: document.getElementById('codigo').value,
            titulo: document.getElementById('titulo').value,
            sinopsis: document.getElementById('sinopsis').value,
            reparto: document.getElementById('reparto').value,
            clasificacion: document.getElementById('clasificacion').value,
            idioma: document.getElementById('idioma').value,
            director: document.getElementById('director').value,
            duracion: document.getElementById('duracion').value,
            genero: document.getElementById('genero').value,
            fechaEstreno: document.getElementById('fechaEstreno').value,
            trailer: document.getElementById('trailer').value,
            poster: document.getElementById('poster').value
        };

        try {
            let response;
            if (isEditing && movieId) {
                response = await put('user/peliculas', movieId, movieData);
            } else {
                response = await post('api/peliculas', movieData);
            }
            
            if (response.message) {
                alert(isEditing ? 'Película actualizada exitosamente' : 'Película agregada exitosamente');
                peliculaForm.reset(); 
                window.location.href = 'peliculas.html'; 
            } else {
                alert(isEditing ? 'Error al actualizar la película' : 'Error al agregar la película');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(isEditing ? 'Error al actualizar la película' : 'Error al agregar la película');
        }
    });

    async function loadMovieData(id) {
        try {
            const movies = await getAll('api/peliculas');
            const movie = movies.find(m => m._id === id);
            
            if (movie) {
                document.getElementById('codigo').value = movie.codigo || '';
                document.getElementById('titulo').value = movie.titulo || '';
                document.getElementById('sinopsis').value = movie.sinopsis || '';
                document.getElementById('reparto').value = movie.reparto || '';
                document.getElementById('clasificacion').value = movie.clasificacion || '';
                document.getElementById('idioma').value = movie.idioma || '';
                document.getElementById('director').value = movie.director || '';
                document.getElementById('duracion').value = movie.duracion || '';
                document.getElementById('genero').value = movie.genero || '';
                document.getElementById('fechaEstreno').value = movie.fechaEstreno ? movie.fechaEstreno.split('T')[0] : '';
                document.getElementById('trailer').value = movie.trailer || '';
                document.getElementById('poster').value = movie.poster || '';
            } else {
                alert('Película no encontrada');
                window.location.href = 'peliculas.html';
            }
        } catch (error) {
            console.error('Error al cargar datos de la película:', error);
            alert('Error al cargar datos de la película');
            window.location.href = 'peliculas.html';
        }
    }
});
