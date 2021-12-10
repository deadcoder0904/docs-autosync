import path from 'path'
import { makeSchema } from 'nexus'
import { nexusPrisma } from '@kenchi/nexus-plugin-prisma'

import Docs from './Docs'

// Only generate in development or when the yarn run generate:nexus command is run
// This fixes deployment on Netlify, otherwise you'll run into an EROFS error during building
const shouldGenerateArtifacts =
  process.env.NODE_ENV === 'development' || !!process.env.GENERATE

export const schema = makeSchema({
  types: [Docs],
  plugins: [
    nexusPrisma({
      shouldGenerateArtifacts,
    }),
  ],
  // Type the GraphQL context when used in Nexus resolvers
  contextType: {
    module: path.join(process.cwd(), 'pages/api/index.ts'),
    export: 'GraphQLContext',
  },
  // Generate the files
  shouldGenerateArtifacts,
  outputs: {
    typegen: path.join(process.cwd(), 'graphql/nexus-types.generated.ts'),
    schema: path.join(process.cwd(), 'graphql/schema.graphql'),
  },
})
