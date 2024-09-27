import { Provider } from '@nestjs/common';
import { createClient } from 'redis';

export const RedisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: async () => {
    const client = createClient({
      url: 'redis://localhost:6379',
    });

    client.on('error', (err) => console.error('Redis Client Error', err));

    await client.connect();
    return client;
  },
};
