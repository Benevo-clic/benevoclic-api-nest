import * as firebaseAdmin from 'firebase-admin';
import { config } from './env.config';

export const initializeFirebase = () => {
  if (firebaseAdmin.apps.length === 0) {
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert({
        projectId: config.firebase.projectId,
        privateKey:
          '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDBTdv3AfE3a7Pn\nS/XF42DuYDUjhy1o8/yGs2sYSzn2t31gqQJ9v6XwLPa3s9OiYWyulwSVASWKEQf6\nWqtIFcsgjaR97X0FoOmJUJU41iVquCJIbUBwK++J2JcKf1EhrBlrpTxTuJ2ifA4K\nWskBz7pJRngfW7T6C0+4iSaUBTHjtK9MtzsRcHFxB6dIA2VbeAoWYnkbCRoYEC/i\nP0fFg+FNIgnTR8gCsVSXnCgCc5VXkXjlPwBVyjqxY/XO8ujLlUqojpCYDfycaCfS\nOcgITJAm/hNWptgNKkWS4I/YgxhWk/pIQyBwCkxxIxOsGtdplYAhDW0lEf3vrJyw\nCVP8yznHAgMBAAECggEACwJYr0I0jz/6kIdCeaFAEYN4M0xNGUegD7njNRB/vh3o\nLZuikS/bjwi4inDa8koTKwRd1fCpRyo+JpOIYsQe+/0lK6jdcHcgJdppjUGhAul2\nxmI2g8z0yQiFXasvnzfSgM951pjSnYDsOcm+3fQLO4YgbETIU19WjH9/K3n6Q+oa\naVJksLM9lpFw+uIKur2jSBizRaeH0tlv8a2qgiS8e0g5djuNlSKoQc+R+oEh2jvr\nSuTg+P8rN+cLZmGeIS2gIg2nmP3SCP/WBEDeymVHhIHMh4BUI0jYTCZjg9JuTvie\nQQ2QKMdzZ+Lp4bbau18LaxS1wcTyaRhNrtYX4wE69QKBgQD+vV06Ewh+IHcuW2Ck\no6WvgafpPMmIq8jmOrF3wR/RuZCFPnY2Tp3qIFGQxcET9fwbWMlre58yG5Li4tU5\nu2VxCRQVO8c+3EU9lxCrbiwqMkjmDd2DSFHSynQE2TFrzDkygFrZza8hIP7E88vs\nz4dxchJvdJaEcX9D3qrroh3/OwKBgQDCQq9b97k9gR8p7Ksln8HBGiGWmYDuxxqM\njY1R1KNBRCpHMvqHMlyjvPP67DzJPCaYlJM4VlWuAvRXTvK/b2bwLPzJTJwhP3n8\nF4DUxgRru1j1o8+QH3vrUw8vYqLn8XrUSUZCbUv27IgvidvdqF7d8awX0oWLZCJA\nSdtStVce5QKBgQDpoDBFF7mdOxcy27k5paBJ4wZlAUvv3WSlycSDCQqupJonqY5u\n5hEr7TIBLWyTavEo/3fS7JCnOuSu0swtY3F4hpP1mVp1izyxbL9sCeHVXULAQo0a\nXxQz11sqKyuJKsZ2S4OG532rS4B8jv9Ck14rrCu+LlXw58qJK0jkTE1oiwKBgQC1\nOikGj3DNJCzCm/x+uS+0yoATU1mpaS4nedchRFKZjNI0Yia/AgjS6HBk4wdCZU9M\ngS9nG4QLNs5ktU5ZscBCyHV8BnCRw/o1aGfUGHf/WWSApTX6qqScwXwlJMv9vpZs\nfX+CcRyxW7EhSGdJvs3iGJgIEWpsxBoAB+cIngyM0QKBgHsiMPPA7zv5fH1K2Qku\nb9Mfi9F8Kylu7czmdPA68Z4GW2kEg1h5IuXakWg+CDdzEAA2I5PXamBWCdy/PwQp\neKTWcM5F3J4aEIc5xNtf/LJ1uIRgaLxDh3dVp8jkf0KT2VqePTKMRnMcQZtmPwuf\nLSUVCeD4plK4J8ZQ7oJalYQ+\n-----END PRIVATE KEY-----\n',
        clientEmail: config.firebase.clientEmail,
      }),
    });
  }
};
