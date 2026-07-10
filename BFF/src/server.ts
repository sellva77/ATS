import app from './app';
import { env } from './config/env';

const port = env.port;

app.listen(port, () => {
  console.log(`BFF server listening on port ${port}`);
});
