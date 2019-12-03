import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  createdAt: Date,
  modifiedAt: Date,
  isDeleted: { type: Boolean, default: false },
})

userSchema.pre('save', function (next) {
  const now = new Date()
  if (!this.createdAt) {
    this.createdAt = now
  }
  this.modifiedAt = now
  next()
})

const userModel = mongoose.model('User', userSchema)

export default userModel
