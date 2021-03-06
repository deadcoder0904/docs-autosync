import { useQueryClient } from 'react-query'
import { useSnapshot } from 'valtio'
import { useReactQueryAutoSync } from 'use-react-query-auto-sync'

import {
  UpdateDocsMutationVariables,
  UpdateDocsDocument,
  UpdateDocsMutation,
} from '../graphql/updateDocs.generated'
import {
  GetDocsByIdDocument,
  GetDocsByIdQuery,
  GetDocsByIdQueryVariables,
} from '../graphql/getDocsById.generated'
import { useCreateDocsMutation } from '../graphql/createDocs.generated'
import { state, Doc } from '../store/index'

function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
  return async (): Promise<TData> => {
    const res = await fetch('http://localhost:3000/api', {
      method: 'POST',
      ...{
        headers: { credentials: 'include', 'content-type': 'application/json' },
      },
      body: JSON.stringify({ query, variables }),
    })
    const json = await res.json()

    if (json.errors) {
      const { message } = json.errors[0]
      throw new Error(message)
    }
    return json.data
  }
}

const useWritingPad = (id: string) => {
  return useReactQueryAutoSync({
    queryOptions: {
      queryKey: ['GetDocsById', { id }],
      queryFn: fetcher<GetDocsByIdQuery, GetDocsByIdQueryVariables>(
        GetDocsByIdDocument,
        { id }
      ),
      enabled: id !== '',
    },
    mutationOptions: {
      mutationFn: (variables?: UpdateDocsMutationVariables) =>
        fetcher<UpdateDocsMutation, UpdateDocsMutationVariables>(
          UpdateDocsDocument,
          variables
        )(),
    },
    autoSaveOptions: { wait: 1000 },
    alertIfUnsavedChanges: true,
  })
}

export const Writer = () => {
  const snap = useSnapshot(state)
  const queryClient = useQueryClient()
  const { mutate } = useCreateDocsMutation({
    onSuccess: (data) => {
      const queryKey = 'GetDocs'
      queryClient.invalidateQueries(queryKey)

      if (data.createDocs?.id) {
        state.setDoc({
          id: data.createDocs.id,
          // ERROR: when creating new docs, textarea still shows old docs text. it should be empty instead as stated below
          text: data.createDocs.text,
        })
      }
    },
  })

  // snap.doc.id gets updated & the api call gets called but the textarea value isn't updated
  const { draft, setDraft, queryResult } = useWritingPad(snap.doc.id)

  const onThreadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const doc: Doc = {
      id: snap.doc.id,
      text: e.target.value,
    }
    state.doc = doc
    setDraft(doc)
  }

  const onClickHandler = () => {
    if (state.doc.id === '') {
      mutate({})
    }
  }

  return (
    <div>
      <span className="absolute font-sans font-bold text-indigo-400 top-7 right-20">
        {queryResult.data?.text === draft?.text ? 'Saved!' : 'Saving...'}
      </span>
      <textarea
        className="border-2 border-gray-500 mx-20 mt-2 font-medium text-lg p-2 z-10 flex-1 h-[90vh] w-[90%] overflow-y-scroll text-gray-900 bg-transparent shadow-none outline-none resize-none focus:ring-0"
        value={draft?.text}
        onChange={onThreadChange}
        onClick={onClickHandler}
        placeholder="Write your thread here..."
        spellCheck={false}
      ></textarea>
    </div>
  )
}
