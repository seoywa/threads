"use server";

import { revalidatePath } from "next/cache";
import { User } from "../models/user.model";
import { connectToDB } from "../mongoose";

export const updateUser = async ({
  userId,
  username,
  name,
  image,
  bio,
  path,
}: {
  userId: string;
  username: string;
  name: string;
  image: string;
  bio: string;
  path: string;
}): Promise<void> => {
  try {
    connectToDB();

    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );
    if (path === "/profile/edit") {
      revalidatePath(path);
      //
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
};

export const fetchUser = async (userId: string) => {
  try {
    await connectToDB();

    return await User.findOne({ id: userId })
    // .populate({
    //   path: "communities",
    //   model: Community
    // });
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
};
