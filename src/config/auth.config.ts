import * as env from 'env-var';

export class AuthConfig {
  static apiKey = env.get('FIREBASE_API_KEY').required().asString();
}
