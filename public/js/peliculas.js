import { getAll, remove } from './services.js';

document.addEventListener('DOMContentLoaded', function() {
    const movieList = document.getElementById('movie-list');

    async function fetchMovies() {
        try {
            const movies = await getAll('api/peliculas');
            console.log('Fetched movies:', movies); 

            movieList.innerHTML = ''; 
            
            movies.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.className = 'movie-item';
                movieItem.innerHTML = `
                    <img src="${movie.poster}" alt="${movie.titulo} Poster" class="movie-poster">
                    <h4>${movie.titulo}</h4>
                    <p>Género: ${movie.genero}</p>
                    <p>Fecha de Estreno: ${movie.fechaEstreno}</p>
                    <div class="movie-actions">
                        <button onclick="viewMovie('${movie._id}')" class="btn-success">Ver</button>
                        <button onclick="editMovie('${movie._id}')" class="btn-secondary">Editar</button>
                        <button onclick="deleteMovie('${movie._id}')" class="btn-danger">Eliminar</button>
                    </div>
                `;
                movieList.appendChild(movieItem);
            });
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    }

    // Función para ver película
    window.viewMovie = function(movieId) {
        window.location.href = `peliculaDetalle.html?id=${movieId}`;
    };

    // Función para editar película
    window.editMovie = function(movieId) {
        window.location.href = `peliculasForm.html?edit=${movieId}`;
    };

    // Función para eliminar película
    window.deleteMovie = async function(movieId) {
        if (confirm('¿Está seguro de que desea eliminar esta película?')) {
            try {
                const result = await remove('user/peliculas', movieId);
                if (result.message && result.message.includes('eliminada exitosamente')) {
                    alert('Película eliminada exitosamente');
                    fetchMovies(); // Recargar la lista
                } else {
                    alert(result.message || 'Error al eliminar la película');
                }
            } catch (error) {
                alert('Error de conexión: ' + error.message);
            }
        }
    };

    fetchMovies();
});
