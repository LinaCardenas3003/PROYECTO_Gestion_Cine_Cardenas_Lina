import { getAll } from './services.js';

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    const container = document.getElementById('movie-details-container');

    if (movieId) {
        loadMovieDetails(movieId);
    } else {
        container.innerHTML = '<div class="error-message">ID de película no especificado</div>';
    }

    async function loadMovieDetails(id) {
        try {
            const movies = await getAll('api/peliculas');
            const movie = movies.find(m => m._id === id);
            
            if (movie) {
                displayMovieDetails(movie);
            } else {
                container.innerHTML = '<div class="error-message">Película no encontrada</div>';
            }
        } catch (error) {
            console.error('Error al cargar detalles de la película:', error);
            container.innerHTML = '<div class="error-message">Error al cargar los detalles de la película</div>';
        }
    }

    function displayMovieDetails(movie) {
        container.innerHTML = `
            <div class="movie-details">
                <div class="movie-hero">
                    <div class="movie-poster-large">
                        <img src="${movie.poster || 'https://via.placeholder.com/300x450?text=Sin+Póster'}" 
                             alt="${movie.titulo} Poster" 
                             class="poster-image">
                    </div>
                    <div class="movie-info">
                        <h1 class="movie-title">${movie.titulo || 'Sin título'}</h1>
                        
                        <div class="movie-meta">
                            <div class="meta-item">
                                <span class="meta-label">Género:</span>
                                <span class="meta-value">${movie.genero || 'N/A'}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Clasificación:</span>
                                <span class="meta-value">${movie.clasificacion || 'N/A'}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Duración:</span>
                                <span class="meta-value">${movie.duracion ? movie.duracion + ' minutos' : 'N/A'}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Idioma:</span>
                                <span class="meta-value">${movie.idioma || 'N/A'}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Fecha de Estreno:</span>
                                <span class="meta-value">${movie.fechaEstreno ? new Date(movie.fechaEstreno).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Código:</span>
                                <span class="meta-value">${movie.codigo || 'N/A'}</span>
                            </div>
                        </div>

                        <div class="movie-credits">
                            <div class="credit-item">
                                <span class="credit-label">Director:</span>
                                <span class="credit-value">${movie.director || 'N/A'}</span>
                            </div>
                            <div class="credit-item">
                                <span class="credit-label">Reparto:</span>
                                <span class="credit-value">${movie.reparto || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="movie-content">
                    <div class="movie-section">
                        <h3>Sinopsis</h3>
                        <p class="movie-synopsis">${movie.sinopsis || 'Sin sinopsis disponible.'}</p>
                    </div>

                    ${movie.trailer ? `
                    <div class="movie-section">
                        <h3>Tráiler</h3>
                        <div class="trailer-container">
                            <iframe 
                                width="100%" 
                                height="400" 
                                src="${getYouTubeEmbedUrl(movie.trailer)}" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                            </iframe>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    function getYouTubeEmbedUrl(url) {
        if (url.includes('youtube.com/watch?v=')) {
            const videoId = url.split('v=')[1];
            const ampersandPosition = videoId.indexOf('&');
            if (ampersandPosition !== -1) {
                return `https://www.youtube.com/embed/${videoId.substring(0, ampersandPosition)}`;
            }
            return `https://www.youtube.com/embed/${videoId}`;
        } else if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1];
            const ampersandPosition = videoId.indexOf('&');
            if (ampersandPosition !== -1) {
                return `https://www.youtube.com/embed/${videoId.substring(0, ampersandPosition)}`;
            }
            return `https://www.youtube.com/embed/${videoId}`;
        }
        return url; 
    }
});
