import { proxy } from 'valtio'

export type Doc = {
  id: string
  text: string
}

export interface IDocsStore {
  doc: Doc
  setDoc(doc: Doc | undefined): void
}

class DocsStore implements IDocsStore {
  doc: Doc = {
    id: '',
    text: '',
  }

  setDoc(doc: Doc | undefined) {
    console.log('setDoc===')
    console.log(this, this.doc, doc)
    // throws error here. TypeError: Cannot read properties of undefined (reading 'doc')
    if (doc) {
      this.doc.id = doc.id
      this.doc.text = doc.text
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
