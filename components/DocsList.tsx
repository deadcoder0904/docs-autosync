import clsx from 'clsx'
import { useEffect } from 'react'
import { useQueryClient } from 'react-query'
import { useSnapshot } from 'valtio'

import { useCreateDocsMutation } from '../graphql/createDocs.generated'
import { useDeleteDocsByIdMutation } from '../graphql/deleteDocsById.generated'
import { useGetDocsQuery } from '../graphql/getDocs.generated'
import { state } from '../store/index'

export const DocsList = () => {
  const snap = useSnapshot(state)
  const queryClient = useQueryClient()
  const { isLoading, isError, isSuccess, data, error } = useGetDocsQuery()
  const { mutate } = useCreateDocsMutation({
    onSuccess: (data) => {
      const queryKey = 'GetDocs'
      queryClient.invalidateQueries(queryKey)

      if (data.createDocs?.id) {
        state.docs.id = data.createDocs.id
      }
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
    mutate({})
  }

  const getDocsById = (id: string) => {
    if (docs) {
      for (let i = 0; i < docs?.length; i++) {
        const el = docs[i]
        console.log({ el, id, snapId: snap.docs.id })
        if (el && el?.id === id) {
          state.setDocs({
            id,
            text: el.text,
          })
        }
      }
    }
  }

  const deleteDocsById = (id: string) => {
    /**
     * doesn't work yet
     * 1. see if current.id = id, then point it to previous one
     */
    if (docs) {
      for (let i = 0; i < docs.length; i++) {
        const current = docs[i]
        let prev
        if (i !== 0) {
          prev = docs[i - 1]
        }
        console.log({ current, id, prev })
        if (current?.id === id && prev?.id && prev?.text) {
          state.setDocs({ id: prev.id, text: prev.text })
        }
      }
      // if (docs.length === 1) {
      //   state.setDocs({ id: '', text: '' })
      // }
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
      {docs?.map((doc) => {
        if (!doc?.id) return null
        console.log({ did: doc.id, sid: state.docs.id })
        return (
          <button
            key={doc.id}
            type="button"
            className={clsx(
              'inline-flex items-center w-full h-12 px-3 mt-0 text-sm font-medium leading-4 shadow-sm dark:text-gray-700 border-primary-light focus:outline-none group',
              {
                'dark:bg-primary-dark border-l-8 border-yellow-400':
                  state.docs.id === doc.id,
                'dark:text-gray-300 dark:hover:bg-primary-darker':
                  state.docs.id !== doc.id,
              }
            )}
            onClick={() => getDocsById(doc.id)}
          >
            <span className="truncate">{doc?.text || 'Empty docs...'}</span>
            <span
              role="button"
              className="ml-auto"
              onClick={() => deleteDocsById(doc.id)}
            >
              ❌
            </span>
          </button>
        )
      })}
    </div>
  )
}
