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
  lat?: number;
  lng?: number;
};
