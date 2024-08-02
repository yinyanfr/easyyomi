import express from 'express';
import { api } from './routers';
import { join } from 'node:path';
import basicAuth from 'express-basic-auth';

const app = express();

if (process.env.BASIC_AUTH_USERNAME && process.env.BASIC_AUTH_PASSWORD) {
  app.use(
    basicAuth({
      users: {
        [process.env.BASIC_AUTH_USERNAME]: process.env.BASIC_AUTH_PASSWORD,
      },
      challenge: true,
    }),
  );
}

app.use('/api', api);

app.get('/', (_, res) => {
  const filePath = join(__dirname, 'web', 'index.html');
  res.sendFile(filePath);
});

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
