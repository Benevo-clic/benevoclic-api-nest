import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  mongodb: {
    url: process.env.MONGODB_URL,
    dbName: process.env.MONGODB_DB_NAME || 'benevoclic',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    secret: process.env.GOOGLE_SECRET,
  },
};
