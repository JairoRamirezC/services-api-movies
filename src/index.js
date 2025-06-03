//* Las siguientes importaciones son CommonJS:
// require('dotenv').config();
// const express = require('express');
// const crypto = require('node:crypto');
// const fs = require('node:fs');
// const path = require('node:path');
// const cors = require('cors');
// const movies = require('./sources/movies.json');
// const { validateMovie, validatePartialMovie } = require('./schemas/movies');
// const app = express();
// app.use(express.json());

//* Las siguientes importaciones son ESM (ECMAScript Modules):
import 'dotenv/config';
import express, { json } from 'express';
const app = express();
app.use(json());
import { corsMiddleWare } from './middlewares/cors.js';
import { routerAPI } from './routers/index.js';
const PORT = process.env.PORT || 2000;

app.disable('x-powered-by'); //* Deshabilitar el encabezado x-powered-by para mayor seguridad (para que no muestre que es un servidor Express)
app.use(corsMiddleWare());
routerAPI(app);



app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});