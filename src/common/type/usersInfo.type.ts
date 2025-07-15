export type Image = {
  data: string;
  contentType: string;
  uploadedAt: Date;
};

export type Location = {
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

export type LocationGeoJson = {
  type: 'Point';
  coordinates: [number, number];
};
