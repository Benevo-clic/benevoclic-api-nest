export type InfoVolunteer = {
  id: string;
  name: string;
  isPresent?: boolean;
  dateAdded?: string;
};

export type InfoAssociation = {
  associationId: string;
  associationName: string;
};

export type VolunteerAssociationFollowing = {
  volunteerId: string;
  volunteerName: string;
  dateAdded?: string;
};
