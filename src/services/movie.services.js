//! *** ESTE ARCHIVO ES CONOCIDO COMO EL MODELO (DONDE SE MANIPULA LA LOGICA DEL NEGOCIO) DE LA ARQUITECTURA MVC (MODEL, VIEW, CONTROLLER). ***
import { writeFile } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import moviesData from '../sources/movies.json' with {type: 'json'}; //* Importando el archivo JSON como un módulo ESM
import { validateMovie, validatePartialMovie } from '../schemas/movies.js';


export class MovieServices {
  constructor(){
    //* Definición de la ruta de archivo para movies.json cuando se trabaja con Modules en javascript */
    const __filename = fileURLToPath(import.meta.url); //* Obtiene toda la ruta del archivo actual (index.js) en formato file://
    const __dirname = dirname(__filename); //* Me convierte la ruta del archivo a un directorio manejable por Node.js (quitando el file:// al inicio y modificando las diagonales de la ruta de dependiendo del OS).
    this.pathMovies = join(__dirname, '../sources', 'movies.json'); //* Ruta completa y correcta al archivo movies.json (el segundo argumento de join 'sources' es el nombre de la carpeta donde se encuentra el archivo y el ultimo es el nombre del archivo a buscar con la extension .json).
    this.movies = moviesData;
  }
  
  async getAllMovies({director}) {
    const filteredMovies = director ? this.movies?.filter(movie => movie.director.toLowerCase() === director.toLowerCase()) : [];
    if (filteredMovies && filteredMovies?.length > 0){
      return filteredMovies;
    }

    return this.movies;
  }

  async getMovieById({id}) {
    if (!id) return {
      message: 'Id is required for this endpoint'
    };
    const movie = this.movies?.filter(movie => movie?.id === id);
    if(movie.length === 0){
      return {
        message: 'Movie not found'
      }
    }
    return movie;
  }

  async create({movieData}){
    const newMovie = {
      id: randomUUID(),
      ...movieData.data
    }

    writeFile(this.pathMovies, JSON.stringify([...this.movies, newMovie], null, 2), errors => {
      if(errors){
        return {
          status: 500,
          message: 'Error al crear la película en la Base de Datos',
          errors
        };
      }
    });

    return {
      status: 201,
      message: 'Película creada exitosamente',
      data: newMovie
    }
  }

  async update({id, body}){
    const movieIndex = id ? this.movies?.findIndex(movie => movie.id === id) : -1;
    if(movieIndex === -1){
      return {
        status: 400,
        message: 'No se encontró la película a actualizar',
        errors: 'No se encontró la película a actualizar',
      };
    }

    const result = validatePartialMovie(body);
    if(result?.error) {
      return {
        status: 422,
        message: 'Error de validación',
        errors: JSON.parse(result?.error?.message)
      };
    }

    const updatedMovie = {
      ...this.movies[movieIndex],
      ...result?.data
    }

    this.movies[movieIndex] = updatedMovie;
    writeFile(this.pathMovies, JSON.stringify(this.movies, null, 2), errors => {
      if(errors){
        return {
          status: 500,
          message: 'Error al actualizar la película en la Base de Datos',
          errors
        };
      }
    });

    return {
      status: 200,
      message: 'Película actualizada',
      data: updatedMovie
    }

  }

  async delete({id}){
    const movieIndex = id ? this.movies?.findIndex(movie => movie.id === id) : -1;
    if(movieIndex === -1){
      return {
        status: 400,
        message: 'No se encontró la película',
        errors: 'No se encontró la película'
      }
    }

    const newMovies = this.movies?.filter(movie => movie.id !== id);
    writeFile(this.pathMovies, JSON.stringify(newMovies, null, 2), errors => {
      if(errors){
        return {
          status: 500,
          message: 'Error al eliminar la película',
          errors
        };
      }
    });

    return {
      status: 200,
      message: 'Película eliminada',
      data: this.movies[movieIndex]
    }
  }
}