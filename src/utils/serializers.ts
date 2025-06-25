import { User } from "@prisma/client";

export const serializeUser = (user: Partial<User>) => ({
  firstName: user.firstName,
  lastName: user.lastName,
  age: user.age,
  email: user.email,
  bio: user.bio,
  linkedIn: user.linkedIn,
  webSite: user.webSite,
  instagram: user.instagram,
  facebook: user.facebook,
  company: user.company,
  role: user.role,
});
