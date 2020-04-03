import React from 'react'
import { ThemeProvider } from 'emotion-theming'
import theme from '@rebass/preset'

import './App.css'

import Popup from './Popup'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Popup />
    </ThemeProvider>
  )
}

export default App
