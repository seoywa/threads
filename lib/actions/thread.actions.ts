"use server";

import { connectToDB } from "../mongoose";
import { Thread } from "../models/thread.model";
import { User } from "../models/user.model";
import { revalidatePath } from "next/cache";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}
export const createThread = async ({
  text,
  author,
  communityId,
  path,
}: Params) => {
  try {
    connectToDB();

    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });

    //UPDATE USER MODEL
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error("Failed to create thread: ", error);
  }
};

export const fetchPosts = async (pageNumber = 1, pageSize = 20) => {
  try {
    connectToDB();
    const skipAmount = (pageNumber - 1) * pageSize;

    const postsQuery = Thread.find({
      //fetch posts that have no parent(aka top level threads)
      parentId: { $in: [null, undefined] },
    })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({
        path: "children",
        model: User,
        select: "_id name parendId image",
      });

      const totalPostsCount = await Thread.countDocuments({ parentId: { $in: [null, undefined] }});

      const posts = await postsQuery.exec();
      const isNext = totalPostsCount > skipAmount + posts.length;

      return {
        posts, isNext
      }

  } catch (error: any) {
    throw new Error("Failed to create thread: ", error);
  }
};

export const fetchThreadById = async (id: string) => {
  connectToDB();

  try {
    const thread = await Thread.findById(id).populate({
      path: 'author',
      model: User,
      select: '_id id name image'
    }).populate({
      path: 'children',
      populate: [
        {
          path: 'author', model: User, select: '_id id name parentId image'
        },
        {
          path: 'children', model: Thread, populate: {
            path: 'author', model: User, select: '_id id name parentId image'
          }
        }
      ]
    }).exec();
    
    return thread;

  } catch (error) {
    console.log(error)
  }
}

export const addCommentToThread = async (
  threadId: string, commentText: string, userId: string, path: string
) => {
  try {
    connectToDB();

    const originalThread = await Thread.findById(threadId);
    if (!originalThread) throw new Error("Thread not found")

    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId
    })

    const savedCommentThread = await commentThread.save();

    originalThread.children.push(savedCommentThread._id);

    //UPDATE USER MODEL
    await originalThread.save()

    revalidatePath(path);
  } catch (error: any) {
    throw new Error("Failed to create comment: ", error);
  }
};