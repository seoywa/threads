"use client";

import React, { ChangeEvent, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import z from "zod";
import { Textarea } from "../ui/textarea";
import { useUploadThing } from "@/lib/uploadthing";
import { usePathname, useRouter } from "next/navigation";
import { commentValidation, threadValidation } from "@/lib/validations/thread";
import { addCommentToThread, createThread } from "@/lib/actions/thread.actions";
import { Input } from "../ui/input";
import Image from "next/image";

interface Props {
  threadId: string,
  currentUserImg: string,
  currentUserId: string
}

const Comment = ({ threadId, currentUserImg, currentUserId }: Props) => {
  const [files, setFiles] = useState<File[]>([]);
    const { startUpload } = useUploadThing("media");
    const pathname = usePathname();
    const router = useRouter();
  
    const form = useForm({
      resolver: zodResolver(commentValidation),
      defaultValues: {
        thread: "",
      },
    });
  
    const onSubmit = async (values: z.infer<typeof commentValidation>) => {
      await addCommentToThread(
        threadId, values.thread, JSON.parse(currentUserId), pathname
      )
  
      form.reset();
    };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="comment-form"
      >

        {/* NAME FIELD */}
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex w-full items-center gap-4">
              <FormLabel>
                <Image src={currentUserImg} alt="Profile image" width={48} height={48} className="rounded-full object-cover" /> 
              </FormLabel>
              <FormControl className="border-none bg-transparent">
                <Input
                type="text"
                placeholder="Comment..."
                  className="text-light-1 no-focus"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="comment-form_btn">
          Reply
        </Button>
      </form>
    </Form>
  );
}

export default Comment