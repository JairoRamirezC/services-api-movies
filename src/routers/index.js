import { Router } from "express";
const router = Router();
import moviesRouter from "./movies.router.js";

export const routerAPI = (app) => {
  app.use('/api/v1', router);
  router.use('/movies', moviesRouter);
}