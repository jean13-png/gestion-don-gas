import type { Donateur, Don, Photo, NatureDon, StatutDon } from "@prisma/client";

export interface DonateurInput {
  nom: string;
  prenom: string;
  organisme?: string;
  email: string;
  telephone: string;
}

export interface DonInput {
  nature: NatureDon;
  description: string;
  localisation: string;
}

export interface DonWithDonateur extends Don {
  donateur: Donateur;
  photos: Photo[];
}

export type { Donateur, Don, Photo, NatureDon, StatutDon };
