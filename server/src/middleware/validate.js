/**
 * Zod validation middleware factory.
 * Usage: router.post('/signup', validate(signupSchema), handler)
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(422).json({ error: 'Validation failed', errors });
    }
    req[source] = result.data; // coerced + stripped data
    next();
  };
}
