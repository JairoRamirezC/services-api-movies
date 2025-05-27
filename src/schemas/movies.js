const zod = require('zod');

const movieSchema = zod.object({
    title: zod.string({
      required_error: 'El campo title es obligatorio',
      invalid_type_error: 'El campo title debe ser de tipo string'
    }).min(1),
    year: zod.number({
      invalid_type_error: 'El campo year debe ser de tipo number',
    }).int().min(1895).max(2025),
    director: zod.string().min(1),
    duration: zod.number().int().positive(),
    poster: zod.string().url({
      message: 'El campo poster debe ser una URL válida',
      invalid_type_error: 'El campo poster debe ser de tipo string'
    }),
    genre: zod.array(
      zod.enum(['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Fantasy', 'Adventure', 'Animation', 'Documentary', 'Mystery', 'Crime', 'Family', 'History', 'War', 'Western'], {
        required_error: 'El campo genre es obligatorio',
        invalid_type_error: 'El campo genre debe ser de tipo array'
      })
    ),
    rate: zod.number().min(0).max(10)
  });

const validateMovie = (data) => {
  return movieSchema.safeParse(data);
}

const validatePartialMovie = (data) => {
  return movieSchema.partial().safeParse(data);
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
