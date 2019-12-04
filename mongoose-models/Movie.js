import mongoose from 'mongoose'

const movieSchema = new mongoose.Schema({
  
  name: { type: String },
  description: {type: String },
  movieID: { type: String, required: true, unique: true },
  createdAt: Date,
  modifiedAt: Date,
  isDeleted: { type: Boolean, default: false },
})

movieSchema.pre('save', function (next) {
  const now = new Date()
  if (!this.createdAt) {
    this.createdAt = now
  }
  this.modifiedAt = now
  next()
})

const movieModel = mongoose.model('Movie', movieSchema)

export default movieModel
