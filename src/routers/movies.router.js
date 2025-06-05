import {Router} from 'express';
const moviesRouter = Router();
import { MovieController } from '../controller/movie.controller.js';


moviesRouter.get('/', MovieController.getMovies);

moviesRouter.get('/:id', MovieController.getMoviesById);

moviesRouter.post('/', MovieController.createMovie);

moviesRouter.patch('/:id', MovieController.updateMovie);

moviesRouter.delete('/:id', MovieController.deleteMovie);

moviesRouter.use((req, res) => {
  res.status(404).json({
    message: 'No se encontró la ruta para el recurso movies',
    status: 'error',
  });
});

export default moviesRouter;