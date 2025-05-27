require('dotenv').config();
const express = require('express');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const cors = require('cors');
const movies = require('./sources/movies.json');
const { validateMovie, validatePartialMovie } = require('./schemas/movies');
//
const app = express();
app.use(express.json());
app.disable('x-powered-by');
const ACCEPTED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:8080', // Puedes agregar más orígenes permitidos aquí
]
// app.use(cors()); // Con esta forma se estaria permitiendo el acceso a todos los orígenes, lo cual no es recomendable en producción
// app.use(cors({
//   origin: 'http://localhost:5173',
//   methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type']
// }));
app.use(cors({
  origin: (origin, callback) => {
    if( !origin || ACCEPTED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: No está permitido el acceso desde este origen'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

const PORT = process.env.PORT || 2000;
const pathMovies = path.join(__dirname, 'sources', 'movies.json');

app.get('/movies', (req, res) => {
  // res.header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  // res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Allow CORS for all origins

  const { director } = req.query;
  const filteredMovies = director && movies?.filter(movie => movie.director.toLowerCase() === director.toLowerCase());
  if (filteredMovies && filteredMovies?.length !== 0) {
    res.status(200).json({
      message: 'Filtro de Peliculas',
      status: 'success',
      data: filteredMovies
    });
    return;
  }

  res.status(200).json({
    message: 'Lista de Peliculas',
    status: 'success',
    data: movies
  });
});

app.get('/movies/:id', (req, res) => {
  const { id } = req.params;
  const movie = movies.find(movie => movie.id === id);
  if (movie) {
    res.status(200).json({
      message: 'Película encontrada',
      status: 'success',
      data: movie
    });
  } else {
    res.status(404).json({
      message: 'Película no encontrada',
      status: 'error',
    });
  }
});

app.post('/movies', (req, res) => {
  // res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Allow CORS for all origins
  const result = validateMovie(req.body);
  if(result.error) {
    // Si hay un error de validación, devolver un error 422 (con esto se entiende que sabe que es lo que recibe pero tiene algun error en alguna propiedad)
    // y no un 400 (que es cuando no sabe que es lo que recibe)
    return res.status(422).json({
      message: 'Error de validación',
      status: 'error',
      errors: JSON.parse(result.error.message)
    });
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }
  fs.writeFile(pathMovies, JSON.stringify([...movies, newMovie], null, 2), error => {
    if(error){
      return res.status(500).json({
        message: 'Error al guardar la película',
        status: 'error',
        error
      });
    }
  });

  res.status(201).json({
    message: 'Película creada',
    status: 'success',
    data: newMovie
  });
});

app.patch('/movies/:id', (req, res) => {
  const { id } = req.params;
  const movieIndex = id ? movies.findIndex(movie => movie.id === id) : -1;
  if(movieIndex === -1){
    return res.status(400).json({
      message: 'No se encontró la película a actualizar',
      status: 'error'
    });
  }

  const result = validatePartialMovie(req.body);
  if(result.error) {
    return res.status(422).json({
      message: 'Error de validación',
      status: 'error',
      errors: JSON.parse(result.error.message)
    });
  }

  const updatedMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updatedMovie;
  fs.writeFile(pathMovies, JSON.stringify(movies, null, 2), error => {
    if(error){
      return res.status(500).json({
        message: 'Error al actualizar la película',
        status: 'error',
        error
      });
    }
  });

  res.status(200).json({
    message: 'Película actualizada',
    status: 'success',
    data: updatedMovie
  });
});

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params;
  const movieIndex = id ? movies.findIndex(movie => movie.id === id) : -1;
  if(movieIndex === -1){
    return res.status(400).json({
      message: 'No se encontró la película',
      status: 'error'
    });
  }

  const newMovies = movies.filter(movie => movie.id !== id);
  fs.writeFile(pathMovies, JSON.stringify(newMovies, null, 2), error => {
    if(error){
      return res.status(500).json({
        message: 'Error al eliminar la película',
        status: 'error',
        error
      });
    }
  });

  res.status(200).json({
    message: 'Película eliminada',
    status: 'success',
    data: movies[movieIndex]
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: 'No se encontró la ruta',
    status: 'error',
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});