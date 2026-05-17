import app from './src/app.js';
import { env } from './src/config/env.js';

app.listen(env.PORT, () => {
  console.log(`[TeamUp API] Running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});
