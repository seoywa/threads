import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, require: true },
  username: { type: String, require: true, unique: true },
  name: { type: String, require: true },
  image: { type: String},
  bio: { type: String},
  threads: [
    { type: mongoose.Schema.Types.ObjectId , ref: 'Thread'}
  ],
  onboarded: { type: Boolean, default: false }, 
  communities: [
    { type: mongoose.Schema.Types.ObjectId , ref: 'Community'}
  ], 
})

export const User = mongoose.models.User || mongoose.model('User', userSchema)