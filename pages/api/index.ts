import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import nc from 'next-connect'
import { ApolloServer } from 'apollo-server-micro'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'
import { error } from 'next/dist/build/output/log'

import prisma from '../../graphql/prisma'
import { schema } from '../../graphql/schema'

function handler() {
  return nc<NextApiRequest, NextApiResponse>({
    onError: (err: any, _: any, res: NextApiResponse) => {
      error(err)
      res.status(500).end(err.toString())
    },
  })
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export interface GraphQLContext {
  prisma: typeof prisma
}

const apolloServer = new ApolloServer({
  schema,
  context: (): GraphQLContext => ({
    prisma,
  }),
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
})

const startServer = apolloServer.start()

const apolloHandler: NextApiHandler = async (req, res) => {
  await startServer
  await apolloServer.createHandler({
    path: '/api',
  })(req, res)
}

export default handler().use(apolloHandler)
