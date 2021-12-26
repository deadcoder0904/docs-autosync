import { useCallback, useState } from 'react'
import { useQueryClient } from 'react-query'
import { useAutosave } from 'react-autosave'

import { useUpdateDocsMutation } from '../graphql/updateDocs.generated'
import { useCreateDocsMutation } from '../graphql/createDocs.generated'
import { state, Doc, useStore } from '../store/index'

export const Writer = () => {
  const [isSaved, toggleIsSaved] = useState(true)
  const snap = useStore()
  const queryClient = useQueryClient()
  const { mutate: updateDocs } = useUpdateDocsMutation()
  const { mutate: createNewDoc } = useCreateDocsMutation({
    onSuccess: (data) => {
      const queryKey = 'GetDocs'
      queryClient.invalidateQueries(queryKey)
      if (data.createDocs?.id) {
        state.setDoc({
          id: data.createDocs.id,
          text: data.createDocs.text,
        })
      }
    },
  })

  const updateDraft = useCallback(
    ({ id, text }: Doc) => {
      if (id && text) {
        updateDocs({ id, text })
      }
      toggleIsSaved(true)
    },
    [snap.currentDoc.id]
  )

  useAutosave({
    data: snap.currentDoc,
    onSave: updateDraft,
    interval: 500,
  })

  const onThreadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    const doc: Doc = {
      id: snap.currentDoc.id,
      text,
    }
    toggleIsSaved(false)
    const i = state.docs.findIndex((item) => item.id === snap.currentDoc.id)
    state.docs[i] = doc
    state.setDoc(doc)
  }

  const onClickHandler = () => {
    if (!state.currentDoc.id) {
      createNewDoc({})
    }
  }

  return (
    <div>
      <span className="absolute font-sans font-bold text-indigo-400 top-7 right-20">
        {isSaved ? 'Saved!' : 'Saving...'}
      </span>
      <textarea
        className="border-2 border-gray-500 mx-20 mt-2 font-medium text-lg p-2 z-10 flex-1 h-[90vh] w-[90%] overflow-y-scroll text-gray-900 bg-transparent shadow-none outline-none resize-none focus:ring-0"
        value={snap.currentDoc.text || ''}
        onChange={onThreadChange}
        onClick={onClickHandler}
        placeholder="Write your thread here..."
        spellCheck={false}
      ></textarea>
    </div>
  )
}
