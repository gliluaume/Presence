import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import React from 'react'
// import { Provider } from 'react-redux'
import Students from './components/student/Students'
import store from './store'

const App = () => (
  <MuiThemeProvider muiTheme={getMuiTheme()}>
    <Students students={store.students} />
  </MuiThemeProvider>
)

export default App
