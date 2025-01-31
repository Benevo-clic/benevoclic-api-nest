import * as env from 'env-var';

export const mongoConfig = {
  mongoConfig(): string {
    const user = env.get('MONGODB_USER').required().asString();
    const password = env.get('MONGODB_PASSWORD').required().asString();
    const host = env.get('MONGODB_HOST').required().asString();
    const port = env.get('MONGODB_PORT').required().asPortNumber();

    return `mongodb://${user}:${password}@${host}:${port}`;
  },

  database(): string {
    return env.get('MONGODB_DATABASE').required().asString();
  },
};
