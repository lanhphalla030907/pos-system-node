import React from 'react'
import AppRoute from './routes/AppRoute'
import { AlertProvider } from './components/common/Alert'

const App = () => {
  return (
    <div>
      <AlertProvider>
      <AppRoute/>
      </AlertProvider>
    </div>
  )
}

export default App