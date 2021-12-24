import { proxy, useSnapshot } from 'valtio'

export type Doc = {
  id?: string
  text?: string
}

export interface IDocsStore {
  docs: Doc[] | []
  currentDoc: Doc
  setDoc(doc: Doc): void
}

class DocsStore implements IDocsStore {
  docs: Doc[] = []
  currentDoc: Doc = {
    id: undefined,
    text: undefined,
  }

  setDoc(doc?: Doc) {
    if (doc) {
      this.currentDoc = doc
    }
  }
}

export const state = proxy<IDocsStore>(new DocsStore())
export const useStore = () => useSnapshot(state)

if (process.env.NODE_ENV === 'development') {
  import('valtio/utils').then((utils) => {
    const { devtools } = utils
    devtools(state, 'docs')
  })
}
