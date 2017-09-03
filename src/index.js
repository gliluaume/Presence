import { AppContainer } from 'react-hot-loader'
import injectTapEventPlugin from 'react-tap-event-plugin'
import React from 'react'
import { render } from 'react-dom'

import App from './App'

injectTapEventPlugin()

function renderApp (RootComponent) {
  render(
    <AppContainer>
      <RootComponent />
    </AppContainer>,
    document.getElementById('root')
  )
}

renderApp(App)

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default
    renderApp(NextApp)
  })
  module.hot.accept()
}
