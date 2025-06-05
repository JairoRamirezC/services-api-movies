import { validateMovie } from "../schemas/movies.js";
import { MovieServices } from "../services/movie.services.js";
const movieDataService = new MovieServices();

export class MovieController {
  
  static async getMovies(req, res) {
    // res.header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    // res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Allow CORS for http://localhost:5173 origin

    const { director } = req.query;
    const allMovies = await movieDataService.getAllMovies({ director });

    res.status(200).json({
      message: "Lista de Peliculas",
      status: "success",
      data: allMovies,
    });
  }

  static async getMoviesById(req, res) {
    const { id } = req.params;
    const movie = await movieDataService.getMovieById({ id });
    if (!movie?.message) {
      res.status(200).json({
        status: "success",
        message: "Película encontrada",
        data: movie,
      });
    } else {
      res.status(404).json({
        status: "error",
        message: movie.message,
      });
    }
  }

  static async createMovie(req, res) {
    // res.header('Access-Control-Allow-Origin', '*'); // Allow CORS for all origins
    const body = req.body;
    const movieData = validateMovie(body);
    if (!movieData.success) {
      // Si hay un error de validación, devolver un error 422 (con esto se entiende que sabe que es lo que recibe pero tiene algun error en alguna propiedad)
      // y no un 400 (que es cuando no sabe que es lo que recibe)
      return res.status(422).json({
        status: "error",
        message: "Error de validación",
        error: JSON.parse(movieData?.error?.message),
      });
    }
    const movieCreate = await movieDataService.create({ movieData });
    if (movieCreate?.errors) {
      return res.status(movieCreate?.status).json({
        status: "Error",
        message: movieCreate?.message,
        message: movieCreate?.errors,
      });
    }

    res.status(movieCreate?.status).json({
      status: "success",
      message: movieCreate?.message,
      data: movieCreate?.data,
    });
  }

  static async updateMovie(req, res) {
    const { id } = req.params;
    const body = req.body;
    if (!id)
      return res.status(422).json({
        status: "error",
        message: "ID es requerido",
        error: "ID es requerido",
      });

    const movieUpdated = await movieDataService.update({ id, body });
    if (movieUpdated?.errors) {
      return res.status(movieUpdated?.status).json({
        status: "error",
        message: movieUpdated?.message,
        error: movieUpdated?.errors,
      });
    }

    res.status(movieUpdated.status).json({
      status: "success",
      message: movieUpdated?.message,
      data: movieUpdated?.data,
    });
  }

  static async deleteMovie(req, res) {
    const { id } = req.params;
    if (!id)
      return res.status(422).json({
        status: "error",
        message: "ID es requerido",
        error: "ID es requerido",
      });
    const movieDeleted = await movieDataService?.delete({ id });
    if (movieDeleted?.errors) {
      return res.status(movieDeleted?.status).json({
        status: "error",
        message: movieDeleted?.message,
        errors: movieDeleted?.errors,
      });
    }

    res.status(movieDeleted?.status).json({
      status: "success",
      message: movieDeleted?.message,
      data: movieDeleted?.data,
    });
  }
}
