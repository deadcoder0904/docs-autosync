import { proxy } from 'valtio'

export type Docs = {
  id: string
  text: string
}

export interface IDocsStore {
  docs: Docs
  setDocs: (docs: Docs) => void
}

class DocsStore implements IDocsStore {
  docs: Docs = {
    id: '',
    text: '',
  }

  setDocs(docs: Docs) {
    this.docs.id = docs.id
    this.docs.text = docs.text
  }
}

export const state = proxy<IDocsStore>(new DocsStore())

if (process.env.NODE_ENV === 'development') {
  import('valtio/utils').then((utils) => {
    const { devtools } = utils
    devtools(state, 'docs')
  })
}
