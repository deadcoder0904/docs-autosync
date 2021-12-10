import { proxy } from 'valtio'

export type Docs = {
  id: string
  text: string
}

export interface IDocsStore {
  docs?: Docs
}

class DocsStore implements IDocsStore {
  docs: Docs = {
    id: '',
    text: '',
  }

  setDocs(data: Docs | undefined) {
    if (!data) return

    this.docs.id = data.id
    this.docs.text = data.text
  }
}

export const state = proxy(new DocsStore())

if (process.env.NODE_ENV === 'development') {
  import('valtio/utils').then((utils) => {
    const { devtools } = utils
    devtools(state, 'docs')
  })
}
