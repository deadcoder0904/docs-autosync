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
import { state } from '../store/index'

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

export const Writer = () => {
  const snap = useSnapshot(state)
  const { draft, setDraft, queryResult } = useReactQueryAutoSync({
    queryOptions: {
      queryKey: ['GetDocsById', variables],
      queryFn: fetcher<GetDocsByIdQuery, GetDocsByIdQueryVariables>(
        GetDocsByIdDocument,
        variables
      ),
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
    draftProvider: {
      draft: state.docs,
      setDraft: state.setDocs,
    },
  })

  const onThreadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const docs = {
      id: snap.docs.id,
      text: e.target.value,
    }
    state.setDocs(docs)
    setDraft({
      ...draft,
      ...docs,
    })
  }

  return (
    <textarea
      className="border-2 border-gray-500 mx-20 mt-2 font-medium text-lg p-2 z-10 flex-1 h-[90vh] w-[90%] overflow-y-scroll text-gray-900 bg-transparent shadow-none outline-none resize-none focus:ring-0"
      value={draft?.text}
      onChange={onThreadChange}
      placeholder="Write your thread here..."
      spellCheck={false}
    ></textarea>
  )
}
