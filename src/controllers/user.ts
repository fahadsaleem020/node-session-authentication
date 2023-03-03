import { client } from "@/configs/client";

export const getUserByEmail = async (email: string) => {
  const user = await client.user.findFirst({
    where: {
      email: {
        equals: email,
      },
    },
  });

  return user;
};

export const getUserById = async (id: string) => {
  const user = await client.user.findFirst({
    where: {
      id: {
        equals: id,
      },
    },
  });

  return user;
};
