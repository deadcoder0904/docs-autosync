import { useCallback, useState } from 'react'
import { useQueryClient } from 'react-query'
import { useSnapshot } from 'valtio'
import { useAutosave } from 'react-autosave'

import { useUpdateDocsMutation } from '../graphql/updateDocs.generated'
import { useCreateDocsMutation } from '../graphql/createDocs.generated'
import { state, Doc } from '../store/index'

export const Writer = () => {
  const [isSaved, toggleIsSaved] = useState(true)
  const snap = useSnapshot(state)
  const queryClient = useQueryClient()
  const { mutate: updateDocs } = useUpdateDocsMutation()
  const { mutate } = useCreateDocsMutation({
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
    (newText: string) => {
      console.log('updateDraft')
      console.log({ id: snap.doc.id, text: newText })
      updateDocs({ id: snap.doc.id, text: newText })
      toggleIsSaved(true)
    },
    [snap.doc.id]
  )

  useAutosave({
    data: snap.doc.text,
    onSave: updateDraft,
  })

  const onThreadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log('onThreadChange')
    toggleIsSaved(false)
    const text = e.target.value
    const doc: Doc = {
      id: snap.doc.id,
      text,
    }
    state.setDoc(doc)
  }

  const onClickHandler = () => {
    if (state.doc.id === '') {
      mutate({})
    }
  }

  return (
    <div>
      <span className="absolute font-sans font-bold text-indigo-400 top-7 right-20">
        {isSaved ? 'Saved!' : 'Saving...'}
      </span>
      <textarea
        className="border-2 border-gray-500 mx-20 mt-2 font-medium text-lg p-2 z-10 flex-1 h-[90vh] w-[90%] overflow-y-scroll text-gray-900 bg-transparent shadow-none outline-none resize-none focus:ring-0"
        value={snap.doc.text}
        onChange={onThreadChange}
        onClick={onClickHandler}
        placeholder="Write your thread here..."
        spellCheck={false}
      ></textarea>
    </div>
  )
}
