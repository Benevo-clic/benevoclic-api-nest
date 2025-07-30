export type InfoVolunteer = {
  id: string;
  name: string;
  isPresent?: boolean;
};

export type InfoAssociation = {
  associationId: string;
  associationName: string;
};

export type VolunteerAssociationFollowing = {
  volunteerId: string;
  volunteerName: string;
};
