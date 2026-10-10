import { Constants, type Enums } from "@/lib/supabase/database.types";

export type DogSex = Enums<"dog_sex">;
export type DogSize = Enums<"dog_size">;
export type DogStatus = Enums<"dog_status">;

export const DOG_SEXES = Constants.public.Enums.dog_sex;
export const DOG_SIZES = Constants.public.Enums.dog_size;
export const DOG_STATUSES = Constants.public.Enums.dog_status;

/** What a gallery card needs; mapped from the query result in queries.ts. */
export type DogCardData = {
  id: string;
  name: string;
  sex: DogSex;
  size: DogSize;
  estimatedBirthDate: string;
  shelterName: string;
  city: string;
  photoUrl: string | null;
};
