"use server";

import { FilterQuery, SortOrder } from "mongoose";
import Community from "../models/community.model";
import { Thread } from "../models/thread.model";
import { User } from "../models/user.model";
import { connectToDB } from "../mongoose";

export const createCommunity = async (
  id: string,
  name: string,
  username: string,
  image: string,
  bio: string,
  createdById: string
) => {
  try {
    connectToDB();

    const user = await User.findOne({ id: createdById });
    if (!user) throw new Error("User not found");

    const newCommunity = new Community({
      id,
      name,
      username,
      image,
      bio,
      createdBy: user._id,
    });

    const createdCommunity = await newCommunity.save();

    user.communities.push(createdCommunity._id);
    await user.save();

    return createdCommunity;
  } catch (error: any) {
    throw new Error(`Failed to create community: ${error.message}`);
  }
};

export const fetchCommunityDetails = async (id: string) => {
  try {
    connectToDB();

    const communityDetails = await Community.findOne({ id }).populate([
      "createdBy",
      {
        path: "members",
        model: User,
        select: "name username image _id id",
      },
    ]);

    return communityDetails;
  } catch (error: any) {
    throw new Error(`Failed to fetch community details: ${error.message}`);
  }
};

export const fetchCommunityPosts = async (id: string) => {
  try {
    connectToDB();

    const communityPosts = await Community.findById(id).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "author",
          model: User,
          select: "name image id",
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "image _id",
          },
        },
      ],
    });

    return communityPosts;
  } catch (error: any) {
    throw new Error(`Failed to fetch community posts: ${error.message}`);
  }
};

export const fetchCommunities = async ({
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) => {
  try {
    connectToDB();

    //Calc the no. of communities to skip based on page number and page size
    const skipAmount = (pageNumber - 1) * pageSize;

    //Create a case-insensitive regEx for the provided search string
    const regex = new RegExp(searchString, "i");

    //Create an initial query object to filter conditions
    const query: FilterQuery<typeof Community> = {};

    //If searchString is not empty, add the OR operator to match either username or name field
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    //Define the sort options for the fetched communities based on criteria
    const sortOptions = { createdAt: sortBy };

    //Create a query to fetch the communities based on search and sort criteria
    const communitiesQuery = Community.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      .populate("members");

    //Count total number of communities that match the search without pagination
    const totalCommunitiesCount = await Community.countDocuments(query);

    const communities = await communitiesQuery.exec();

    //check if there are more communities beyond the current page: y/n
    const isNext = totalCommunitiesCount > skipAmount + communities.length;

    return { communities, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch user's communities: ${error.message}`);
  }
};

export const addMemberToCommunity = async (
  communityId: string,
  memberId: string
) => {
  try {
    connectToDB();

    const community = await Community.findOne({ id: communityId });
    if (!community) throw new Error("Community not found");

    const user = await User.findOne({ id: memberId });
    if (!user) throw new Error("User not found");

    //Check if the user is alr a member of this community
    if (community.member.includes(user._id))
      throw new Error("User is already a member of the community");

    //Add the user's id to the members array of this community and vice versa, add the community id to this user's communities array
    community.members.push(user._id);
    await community.save();
    user.communities.push(community._id);
    await user.save();

    return community;
  } catch (error: any) {
    throw new Error(`Failed to add to community: ${error.message}`);
  }
};

export const removeUserFromCommunity = async (
  userId: string,
  communityId: string
) => {
  try {
    connectToDB();

    const userIdObject = await User.findOne({ id: userId }, { _id: 1 });
    if (!userIdObject) throw new Error("User not found");
    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );
    if (!communityIdObject) throw new Error("Community not found");

    //Remove user's id from the member array of the community and vice versa
    await Community.updateOne(
      { _id: communityIdObject._id },
      { $pull: { members: userIdObject._id } }
    );
    await User.updateOne(
      { _id: userIdObject._id },
      { $pull: { communities: communityIdObject._id } }
    );

    return { success: true }

  } catch (error: any) {
    throw new Error(`Failed to remove user from community: ${error.message}`);
  }
};

export const updateCommunityInfo = async (
  communityId: string,
  name: string,
  username: string,
  image: string
) => {
  try {
    connectToDB();

    const updatedCommunity = await Community.findOneAndUpdate(
      { id: communityId },
      { name, username, image }
    )
    if (!updatedCommunity) throw new Error('Community not found');

    return updatedCommunity;

  } catch (error: any) {
    throw new Error(`Failed to update community infomation: ${error.message}`);
  }
};

export const deleteCommunity = async (communityId: string) => {
  try {
    connectToDB();

    const deletedCommunity = await Community.findOneAndDelete({id: communityId});
    if (!deletedCommunity) throw new Error('Community not found');

    //Delete all threads associated with the community
    await Thread.deleteMany({ community: communityId });
    //Find all users who are part of the community
    const communityUsers = await User.find({ communities: communityId });
    //Remove the said community from the communities array of each user
    const updateUserPromises = communityUsers.map(user => {
      user.communities.pull(communityId);
      return user.save();
    });

    await Promise.all(updateUserPromises);

    return deletedCommunity;

  } catch (error: any) {
    throw new Error(`Failed to delete community: ${error.message}`);
  }
};
