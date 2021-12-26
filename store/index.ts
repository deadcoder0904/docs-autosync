import { proxy, useSnapshot } from 'valtio'

export type Doc = {
  id?: string
  text?: string
}

export interface IDocsStore {
  docs: Doc[] | []
  currentDoc: Doc
  setCurrentDoc(doc: Doc): void
}

class DocsStore implements IDocsStore {
  docs: Doc[] = []
  currentDoc: Doc = {
    id: undefined,
    text: undefined,
  }

  setCurrentDoc(newDoc?: Doc) {
    if (newDoc) {
      this.currentDoc = newDoc
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
