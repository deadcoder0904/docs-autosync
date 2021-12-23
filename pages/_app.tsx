import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { ReactQueryDevtools } from 'react-query/devtools'

import '../styles/globals.css'

const MyApp = ({ Component, pageProps }: AppProps) => {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
      <Toaster position="bottom-left" />
      <Component {...pageProps} />
    </QueryClientProvider>
  )
}

export default MyApp
