import clsx from 'clsx'
import { useEffect } from 'react'
import { useQueryClient } from 'react-query'
import { useSnapshot } from 'valtio'

import { useCreateDocsMutation } from '../graphql/createDocs.generated'
import { useGetDocsQuery } from '../graphql/getDocs.generated'
import { state } from '../store/index'

export const DocsList = () => {
  const snap = useSnapshot(state)
  const queryClient = useQueryClient()
  const { data } = useGetDocsQuery()
  const { mutate } = useCreateDocsMutation({
    onSuccess: (data) => {
      const queryKey = 'GetDocs'
      queryClient.invalidateQueries(queryKey)

      if (data.createDocs?.id) {
        state.docs.id = data.createDocs?.id
      }
    },
  })

  const docs = data?.docs

  useEffect(() => {
    if (docs && docs?.length > 0 && docs[0] && state.docs.id === '') {
      state.docs = docs[0]
    }
  }, [])

  const createNewDocs = () => {
    mutate({})
  }

  const getDocsById = (id: string) => {
    state.docs.id = id
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

        return (
          <button
            key={doc.id}
            type="button"
            className={clsx(
              'inline-flex items-center w-full h-12 px-3 mt-0 text-sm font-medium leading-4 shadow-sm dark:text-gray-700 border-primary-light focus:outline-none group',
              {
                'dark:bg-primary-dark border-l-8 border-yellow-400':
                  snap.docs.id === doc.id,
                'dark:text-gray-300 dark:hover:bg-primary-darker':
                  snap.docs.id !== doc.id,
              }
            )}
            onClick={() => getDocsById(doc.id)}
          >
            <span className="truncate">{doc?.text || 'Empty docs...'}</span>
          </button>
        )
      })}
    </div>
  )
}
