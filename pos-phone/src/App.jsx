import React from 'react'
import AppRoute from './routes/AppRoute'
import { AlertProvider } from './components/common/Alert'
import { SettingsProvider } from './store/settings.store'
import { LanguageProvider } from './store/language.store'
import { NotificationProvider } from './store/notification.store'

const App = () => {
  return (
    <div>
      <AlertProvider>
      <SettingsProvider>
      <LanguageProvider>
      <NotificationProvider>
      <AppRoute/>
      </NotificationProvider>
      </LanguageProvider>
      </SettingsProvider>
      </AlertProvider>
    </div>
  )
}

export default App