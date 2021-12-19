import { extendType, nonNull, objectType, stringArg } from 'nexus'
import prisma from './prisma'

const Docs = objectType({
  name: 'Docs',
  definition(t) {
    t.model.id()
    t.model.text()
    t.model.published()
  },
})

const queries = extendType({
  type: 'Query',
  definition: (t) => {
    t.list.field('docs', {
      type: 'Docs',
      resolve: (_, __, ctx) => {
        return prisma.docs.findMany({
          orderBy: {
            modified_at: 'desc',
          },
        })
      },
    })
    t.field('getDocsById', {
      type: 'Docs',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: (_, { id }, ctx) => {
        if (id === '') return null

        return prisma.docs.findUnique({
          where: {
            id,
          },
        })
      },
    })
  },
})

const mutations = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.nullable.field('createDocs', {
      type: 'Docs',
      args: {},
      resolve: async (_, __, ctx) => {
        return await prisma.docs.create({
          data: {},
        })
      },
    })

    t.nullable.field('updateDocs', {
      type: 'Docs',
      args: {
        id: nonNull(stringArg()),
        text: nonNull(stringArg()),
      },
      resolve: async (_, { id, text }, ctx) => {
        return await prisma.docs.update({
          data: { text },
          where: { id },
        })
      },
    })

    t.nullable.field('deleteDocsById', {
      type: 'Docs',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_, { id }, ctx) => {
        return await prisma.docs.delete({
          where: { id },
        })
      },
    })
  },
})

export default [Docs, mutations, queries]
