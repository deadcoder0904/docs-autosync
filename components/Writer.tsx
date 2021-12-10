import { useSnapshot } from 'valtio'
import { useReactQueryAutoSync } from 'use-react-query-auto-sync'

import {
  UpdateDocsMutationVariables,
  useUpdateDocsMutation,
} from '../graphql/updateDocs.generated'
import { useGetDocsByIdQuery } from '../graphql/getDocsById.generated'
import { state } from '../store/index'

export const Writer = () => {
  const snap = useSnapshot(state)
  const { data } = useGetDocsByIdQuery({ id: state.docs.id })
  const { mutate } = useUpdateDocsMutation()
  const { draft, setDraft, queryResult } = useReactQueryAutoSync({
    queryOptions: {
      queryFn: async () => {
        return data?.getDocsById
      },
    },
    mutationOptions: {
      mutationFn: async ({ id, text }: UpdateDocsMutationVariables) => {
        return mutate({
          id,
          text,
        })
      },
    },
    autoSaveOptions: { wait: 1000 },
    alertIfUnsavedChanges: true,
    draftProvider: {
      draft: state.docs,
      setDraft: state.setDocs,
    },
  })

  const onThreadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft({
      ...draft,
      id: snap.docs.id,
      text: e.target.value,
    })
  }

  return (
    <textarea
      className="border-2 border-gray-500 mx-20 mt-2 font-medium text-lg p-2 z-10 flex-1 h-[90vh] w-[90%] overflow-y-scroll text-white bg-transparent shadow-none outline-none resize-none focus:ring-0"
      value={draft?.text}
      onChange={onThreadChange}
      placeholder="Write your thread here..."
      spellCheck={false}
    ></textarea>
  )
}
