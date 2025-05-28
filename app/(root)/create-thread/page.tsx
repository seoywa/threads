import PostThread from '@/components/forms/PostThread';
import { fetchUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation';
import React from 'react'

const CreateThread = async () => {
  const user = await currentUser();
  if (!user) redirect('/sign-in');
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect('/onboarding');

  return (
    <>
    <div className='head-text'>Create Thread</div>
    <PostThread userId={userInfo._id} />
    </>
  )
}

export default CreateThread