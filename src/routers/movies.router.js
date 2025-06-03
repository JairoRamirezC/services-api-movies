import {Router} from 'express';
const moviesRouter = Router();
import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import movies from '../sources/movies.json' with { type: 'json' }; //* Importando el archivo JSON como un módulo ESM
import { validateMovie, validatePartialMovie } from '../schemas/movies.js';


//* Definición de la ruta de archivo para movies.json */
const __filename = fileURLToPath(import.meta.url); //* Obtiene toda la ruta del archivo actual (index.js) en formato file://
const __dirname = dirname(__filename); //* Me convierte la ruta del archivo a un directorio manejable por Node.js (quitando el file:// al inicio y modificando las diagonales de la ruta de dependiendo del OS).
const pathMovies = join(__dirname, 'sources', 'movies.json'); //* Ruta completa y correcta al archivo movies.json (el segundo argumento de join 'sources' es el nombre de la carpeta donde se encuentra el archivo y el ultimo es el nombre del archivo a buscar con la extension .json).

moviesRouter.get('/', (req, res) => {
  // res.header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  // res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Allow CORS for http://localhost:5173 origin

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

moviesRouter.get('/:id', (req, res) => {
  const { id } = req.params;
  const movie = movies?.find(movie => movie.id === id);
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

moviesRouter.post('/', (req, res) => {
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
    id: randomUUID(),
    ...result.data
  }
  writeFile(pathMovies, JSON.stringify([...movies, newMovie], null, 2), error => {
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

moviesRouter.patch('/:id', (req, res) => {
  const { id } = req.params;
  const movieIndex = id ? movies?.findIndex(movie => movie.id === id) : -1;
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
  writeFile(pathMovies, JSON.stringify(movies, null, 2), error => {
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

moviesRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  const movieIndex = id ? movies?.findIndex(movie => movie.id === id) : -1;
  if(movieIndex === -1){
    return res.status(400).json({
      message: 'No se encontró la película',
      status: 'error'
    });
  }

  const newMovies = movies?.filter(movie => movie.id !== id);
  writeFile(pathMovies, JSON.stringify(newMovies, null, 2), error => {
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

moviesRouter.use((req, res) => {
  res.status(404).json({
    message: 'No se encontró la ruta para el recurso movies',
    status: 'error',
  });
});

export default moviesRouter;