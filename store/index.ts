import { proxy } from 'valtio'

export type Doc = {
  id?: string
  text?: string
}

export interface IDocsStore {
  doc: Doc
  setDoc(doc: Doc): void
}

class DocsStore implements IDocsStore {
  doc: Doc = {
    id: undefined,
    text: undefined,
  }

  setDoc(doc?: Doc) {
    if (doc) {
      this.doc = doc
    }
  }
}

export const state = proxy<IDocsStore>(new DocsStore())

if (process.env.NODE_ENV === 'development') {
  import('valtio/utils').then((utils) => {
    const { devtools } = utils
    devtools(state, 'docs')
  })
}
