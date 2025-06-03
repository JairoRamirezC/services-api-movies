import cors from 'cors';

const ACCEPTED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080', //* Puedes agregar más orígenes permitidos dentro de este array
]

// app.use(cors()); //* Con esta forma se estaria permitiendo el acceso a todos los orígenes, lo cual no es recomendable en producción
// app.use(cors({
//   origin: 'http://localhost:5173',
//   methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type']
// }));


//* Cuando se requiera agregar mas de un origen, se puede hacer de la siguiente manera:
export const corsMiddleWare = () => {
  return cors({
    origin: (origin, callback) => {
      if (!origin || ACCEPTED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(
          new Error(
            "CORS policy: No está permitido el acceso desde este origen"
          )
        );
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  });
};
