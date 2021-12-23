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

  useEffect(
    () =>
      subscribe(state.doc, () => {
        console.log('subscribe---')
        console.log(state.doc.text)
        // state.setDoc()
      }),
    []
  )

  const { mutate: createNewDocument } = useCreateDocsMutation({
    onMutate: async () => {
      const queryKey = 'GetDocs'
      await queryClient.cancelQueries(queryKey)

      const newDocs: Doc = {
        id: v4(),
        text: '',
      }

      state.setDoc(newDocs)

      const previousDocs = queryClient.getQueryData<IDocs>(queryKey)

      queryClient.setQueryData<IDocs>(queryKey, (oldData: any) => ({
        docs: [newDocs, ...oldData?.docs],
      }))
      console.log(`onMutate -> ${newDocs.id}`)

      return { previousDocs }
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_, __, context: any) => {
      if (context?.previousDocs) {
        console.log('onErr')
        queryClient.setQueryData('GetDocs', context.previousDocs)
      }
    },
    // Always refetch after error or success:
    onSettled: (newDocs) => {
      if (newDocs?.createDocs) {
        const { id, text } = newDocs.createDocs
        console.log(`onSettled -> ${id}`)
        state.setDoc({ id, text })
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
        const docs = previousData.docs
        if (docs.length === 1) {
          console.log(state.doc)
          state.setDoc({ id: undefined, text: undefined })
          console.log({ previousData, len: docs.length, doc: state.doc })
        }
        queryClient.setQueryData<IDocs>(queryKey, {
          docs: docs.filter((doc) => doc.id !== deletedDocs.id),
        })
      }

      return { previousData }
    },
    onError: (_, __, context: any) => {
      if (context?.previousDocs) {
        queryClient.setQueryData('GetDocs', context.previousDocs)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries('GetDocs')
      toast.success('Successfully deleted!')
    },
  })

  const docs = data?.docs

  const createNewDocs = () => {
    createNewDocument({})
  }

  const getDocsById = (id: string) => {
    if (docs) {
      const el = docs.find((item) => item?.id === id)

      if (el) {
        state.setDoc({
          id,
          text: el.text,
        })
      }
    }
  }
  const deleteDocsById = (id: string) => {
    console.log(`deleteDocsById -> ${id}`)
    if (docs) {
      const el = docs.find((item) => item?.id === id)
      if (el && el.id === snap.doc.id) {
        state.setDoc({
          id: undefined,
          text: undefined,
        })
      }
    }
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
      {docs?.map((doc, i) => {
        if (!doc?.id) return null

        if (i === 0 && !snap.doc.id) {
          state.setDoc({
            id: doc.id,
            text: doc.text,
          })
        }

        const selected = snap.doc.id === doc.id
        const text = selected ? snap.doc.text : doc.text

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
