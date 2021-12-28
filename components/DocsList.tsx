import clsx from 'clsx'
import { MouseEvent, useState, useEffect } from 'react'
import { v4 } from 'uuid'
import toast from 'react-hot-toast'
import { subscribe } from 'valtio'
import { useQueryClient } from 'react-query'

import { useCreateDocsMutation } from '../graphql/createDocs.generated'
import { useDeleteDocsByIdMutation } from '../graphql/deleteDocsById.generated'
import { useGetDocsQuery } from '../graphql/getDocs.generated'
import { Doc, state, useStore } from '../store/index'

interface IDocs {
  docs: Doc[]
}

export const DocsList = () => {
  const snap = useStore()
  const queryClient = useQueryClient()
  const { data } = useGetDocsQuery()

  const { mutate: createNewDocument } = useCreateDocsMutation({
    onMutate: async () => {
      const queryKey = 'GetDocs'
      await queryClient.cancelQueries(queryKey)

      const newDocs: Doc = {
        id: v4(),
        text: '',
      }

      const previousDocs = queryClient.getQueryData<IDocs>(queryKey)

      queryClient.setQueryData<IDocs>(queryKey, (oldData: any) => ({
        docs: [newDocs, ...oldData?.docs],
      }))

      return { previousDocs }
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_, __, context: any) => {
      if (context?.previousDocs) {
        queryClient.setQueryData('GetDocs', context.previousDocs)
      }
    },
    // Refetch after success:
    onSuccess: (newDocs) => {
      if (newDocs?.createDocs) {
        const { id, text } = newDocs.createDocs
        state.setCurrentDoc({ id, text })
      }
      queryClient.invalidateQueries('GetDocs')
      toast.success('Successfully created!')
    },
  })

  const { mutate: deleteDocs } = useDeleteDocsByIdMutation({
    onMutate: async (deletedDocs: Doc) => {
      const queryKey = 'GetDocs'
      await queryClient.cancelQueries(queryKey)

      const previousData = queryClient.getQueryData<IDocs>(queryKey)
      if (previousData) {
        queryClient.setQueryData<IDocs>(queryKey, {
          docs: previousData.docs.filter((doc) => doc.id !== deletedDocs.id),
        })
      }

      return { previousData }
    },
    onError: (_, __, context: any) => {
      if (context?.previousDocs) {
        queryClient.setQueryData('GetDocs', context.previousDocs)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries('GetDocs')

      const previousData = queryClient.getQueryData<IDocs>('GetDocs')
      if (previousData && previousData.docs.length === 0) {
        state.setCurrentDoc({ id: undefined, text: undefined })
      }

      toast.success('Successfully deleted!')
    },
  })

  useEffect(() => {
    if (data?.docs) {
      const latestDocs = []
      for (let item of data.docs) {
        if (item) {
          latestDocs.push(item)
        }
      }
      state.docs = latestDocs
    }
  }, [data?.docs])

  const createNewDocs = () => {
    createNewDocument({})
  }

  const getDocsById = (id: string | undefined) => {
    if (!id) return null
    if (state.docs) {
      const el = state.docs.find((item) => item.id === id)

      if (el) {
        state.setCurrentDoc({
          id,
          text: el.text,
        })
      }
    }
  }

  const deleteDocsById = (id: string | undefined) => {
    if (!id) return null

    deleteDocs({ id })
  }

  return (
    <div className="mt-2 border-2 border-gray-900">
      <button
        type="button"
        className="inline-flex items-center w-full h-12 px-3 mt-0 text-sm font-medium leading-4 border-b-2 border-gray-900 shadow-sm dark:text-gray-500 focus:outline-none hover:text-white hover:bg-gray-700"
        onClick={createNewDocs}
      >
        New Docs
      </button>
      {snap.docs.map((doc, i) => {
        if (!doc.id) return null

        if (i === 0 && !snap.currentDoc.id) {
          state.setCurrentDoc({
            id: doc.id,
            text: doc.text,
          })
        }

        const selected = snap.currentDoc.id === doc.id
        const text = selected ? snap.currentDoc.text : doc.text

        return (
          <button
            key={doc.id}
            type="button"
            className={clsx(
              'inline-flex items-center w-full h-12 pl-3 mt-0 text-sm font-medium leading-4 shadow-sm border-primary-light focus:outline-none group',
              {
                'dark:text-gray-700 dark:bg-primary-dark border-l-8 border-yellow-400':
                  selected,
                'dark:text-gray-300 dark:hover:bg-primary-darker': !selected,
              }
            )}
            onClick={() => getDocsById(doc.id)}
          >
            <span className="truncate">{text || 'Empty docs...'}</span>
            <span
              role="button"
              className="p-4 ml-auto bg-red-200"
              onClick={(e: MouseEvent<HTMLSpanElement>) => {
                e.stopPropagation()
                deleteDocsById(doc.id)
              }}
            >
              ❌
            </span>
          </button>
        )
      })}
    </div>
  )
}
