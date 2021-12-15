import { proxy } from 'valtio'

export type Doc = {
  id: string
  text: string
}

export interface IDocsStore {
  doc: Doc
  setDoc: (doc: Doc) => void
}

class DocsStore implements IDocsStore {
  doc: Doc = {
    id: '',
    text: '',
  }

  setDoc(docs: Doc) {
    this.doc.id = docs.id
    this.doc.text = docs.text
  }
}

export const state = proxy<IDocsStore>(new DocsStore())

if (process.env.NODE_ENV === 'development') {
  import('valtio/utils').then((utils) => {
    const { devtools } = utils
    devtools(state, 'docs')
  })
}
