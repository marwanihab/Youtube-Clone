import { ApolloServer } from 'apollo-server'
import mongoose from 'mongoose'
import { pathOr, prop, path, propOr } from 'ramda'

import environment from './environment'
import appModule from './modules/app'


const DB_URI = pathOr('mongodb://marwan.ihab:dbadmin1@ds029675.mlab.com:29675/video-share-app', ['DB_URI'], process.env)

// connecting to database server. options passed to avoid deprecation warnings
mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
  console.log(`connected to database @ ${DB_URI}`)
})
const server = new ApolloServer({
  schema: prop('schema', appModule),
  introspection: path(['apollo', 'introspection'], environment),
  playground: path(['apollo', 'playground'], environment),
  context: ({ req }) => {
    const header = propOr(null, 'authorization')(req.headers)
    if (header) return { token: header.split(' ')[1] }
    return { token: null }
  },
})

server.listen(environment.port)
  .then(({ url }) => console.log(`Server ready at ${url}. `))

if (module.hot) {
  module.hot.accept()
  module.hot.dispose(() => server.stop())
}
