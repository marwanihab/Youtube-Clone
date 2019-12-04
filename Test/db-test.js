import mongoose from 'mongoose'
import Movie from '../mongoose-models/Movie'
import User from '../mongoose-models/User'

export const Models = {
    movie: Movie,
    user: User
} 

// export const _ensureIndexesRecursive = async(modelNames, currentIndex, done) => {
//     if (currentModelIndex < modelNames.length) {
//         var model = mongoose.model(modelNames[currentIndex++]);
//         model.ensureIndexes(function(error) {
//             if (error) {
//                 return done(error);
//             }
//             _ensureIndexesRecursive(modelNames, currentIndex, done);
//         });
//     }
//     else {
//         done();
//     }
// }
// export const CleanDatabase= async(done) => {
   
//     mongoose.connection.db.dropDatabase();
//     var modelNames = mongoose.modelNames();
//     _ensureIndexesRecursive(modelNames, 0, done);
//     done()

// }

export const cleanDb = async(done) => {
    await Models.movie.deleteMany({});
    await Models.user.deleteMany({});
    done()
}


export const connectDb = async() => {
    const connection = await mongoose.connect('mongodb://marwan.ihab:dbadmin1@ds121349.mlab.com:21349/video-share-app-test',
    { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
    return connection
}

export const disconnectDb = async (done = () => {}) => {
    mongoose.disconnect(done)
}

export const generateMongooseId = () => {
    return mongoose.Types.ObjectId()
  }

  

