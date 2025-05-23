require('dotenv').config();
const express = require('express');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const movies = require('./sources/movies.json');
const app = express();
app.use(express.json());
app.disable('x-powered-by');


const PORT = process.env.PORT || 2000;
const pathMovies = path.join(__dirname, 'sources', 'movies.json');

// app.get('/', (req, res) => {
//   res.status(200).json({
//     message: 'Bienvenido a la API de prueba',
//     status: 'success',
//   })
// });

app.get('/movies', (req, res) => {
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
  if(!req.body || Object.values(req.body).length === 0){
    return res.status(400).json({
      message: 'No se recibieron datos en el body',
      status: 'Error'
    });
  }

  const { title, year, director, duration, rate } = req.body;

  if ( !title ) return res.status(400).json({
    message: 'El campo title es obligatorio',
    status: 'error'
  });
  if ( !year || typeof year === 'string') return res.status(400).json({
    message: 'El campo year es de tipo numerico y obligatorio',
    status: 'error'
  });
  if ( !director ) return res.status(400).json({
    message: 'El campo director es obligatorio',
    status: 'error'
  });
  if ( !duration || typeof duration === 'string' ) return res.status(400).json({
    message: 'El campo duration es de tipo numerico y obligatorio',
    status: 'error'
  });
  if ( !rate || typeof rate === 'string' ) return res.status(400).json({
    message: 'El campo rate es de tipo numerico y obligatorio',
    status: 'error'
  });

  const newMovie = {
    id: crypto.randomUUID(),
    title,
    year,
    director,
    duration,
    rate
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