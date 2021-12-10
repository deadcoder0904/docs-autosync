import { Writer, DocsList } from '../components/index'

const Home = () => {
  return (
    <div className="grid grid-cols-[225px,auto] m-2">
      <DocsList />
      <Writer />
    </div>
  )
}

export default Home
