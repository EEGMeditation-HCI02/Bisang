import React from "react";
import { useContext } from "react";

export type UserType = {
  id: string;
  name?: string;
  avatar_url?: string;
  age_group?: string;
  primary_focus?: string;
  audio_guidance?: string;
};

export type UserContextType = {
  user: UserType | null;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
};

export const UserContext = React.createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export function useUser() {
  return useContext(UserContext);
}