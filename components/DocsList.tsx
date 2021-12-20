import clsx from 'clsx'
import { MouseEvent, MouseEventHandler, useEffect } from 'react'
import { useQueryClient } from 'react-query'
import { useSnapshot } from 'valtio'

import { useCreateDocsMutation } from '../graphql/createDocs.generated'
import { useDeleteDocsByIdMutation } from '../graphql/deleteDocsById.generated'
import { useGetDocsQuery } from '../graphql/getDocs.generated'
import { Doc, state } from '../store/index'

export const DocsList = () => {
  const snap = useSnapshot(state)
  const queryClient = useQueryClient()
  const { data } = useGetDocsQuery()
  const { mutate: createNewDocument } = useCreateDocsMutation({
    onMutate: async (newDocs: Doc) => {
      const queryKey = 'GetDocs'
      await queryClient.cancelQueries(queryKey)

      const previousDocs = queryClient.getQueryData<Doc[] | undefined>(queryKey)

      queryClient.setQueryData<Doc[] | undefined>(queryKey, (oldDocs: any) => {
        return { ...oldDocs, ...newDocs }
      })

      return { previousDocs }
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newDocs, context: any) => {
      queryClient.setQueryData('GetDocs', context.previousDocs)
    },
    // Always refetch after error or success:
    onSettled: (newDocs, error, variables, context) => {
      if (newDocs?.createDocs) {
        const { id, text } = newDocs.createDocs
        state.setDoc({ id, text })
      }
      queryClient.invalidateQueries('GetDocs')
    },
  })

  const { mutate: deleteDocs } = useDeleteDocsByIdMutation({
    onSuccess: (data) => {
      const queryKey = 'GetDocs'
      queryClient.invalidateQueries(queryKey)
    },
  })

  const docs = data?.docs

  const createNewDocs = () => {
    createNewDocument({})
  }

  const getDocsById = (id: string) => {
    if (docs) {
      for (let i = 0; i < docs?.length; i++) {
        const el = docs[i]
        if (el && el?.id === id) {
          state.setDoc({
            id,
            text: el.text,
          })
        }
      }
    }
  }

  const deleteDocsById = (id: string) => {
    console.log(`deleteDocsById -> ${id}`)
    if (docs) {
      for (let i = 0; i < docs.length; i++) {
        const prev = i === 0 ? undefined : docs[i - 1]
        const current = docs[i]
        const next = i < docs.length - 1 ? docs[i + 1] : undefined

        console.log({ prev, current, next })
        if (current?.id === id) {
          if (prev) {
            console.log('inside if')
            state.setDoc({ id: prev.id, text: prev.text })
          } else {
            console.log('else')
            // if the first item (i=0) is selected, then make the next one selected when deleting the first item
            const next = docs[i + 1]
            console.log({ next, i })
            if (next) {
              state.setDoc({ id: next.id, text: next.text })
            } else if (docs.length === 1) {
              console.log(docs.length === 1)
              state.setDoc({ id: undefined, text: undefined })
            }
          }
        }
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

        if (i === 0 && !state.doc.id) {
          state.setDoc({
            id: doc.id,
            text: doc.text,
          })
        }

        return (
          <button
            key={doc.id}
            type="button"
            className={clsx(
              'inline-flex items-center w-full h-12 pl-3 mt-0 text-sm font-medium leading-4 shadow-sm dark:text-gray-700 border-primary-light focus:outline-none group',
              {
                'dark:bg-primary-dark border-l-8 border-yellow-400':
                  snap.doc.id === doc.id,
                'dark:text-gray-300 dark:hover:bg-primary-darker':
                  snap.doc.id !== doc.id,
              }
            )}
            onClick={() => getDocsById(doc.id)}
          >
            <span className="truncate">{doc?.text || 'Empty docs...'}</span>
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
