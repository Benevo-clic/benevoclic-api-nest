export type Location = {
  address: string;
  latitude: number;
  longitude: number;
};

export type InfoVolunteer = {
  id: string;
  name: string;
};

export type ProfileImage = {
  url: string;
  filename: string;
  contentType: string;
  uploadedAt: Date;
};
