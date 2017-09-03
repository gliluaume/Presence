// Using the app everyday

export const LOGIN = '@@GOALTRACKER/AUTH_LOGIN'
export const LOGOUT = '@@GOALTRACKER/AUTH_LOGOUT'

export function logIn (email, password) {
  return { type: LOGIN, payload: { email, password } }
}

export function logOut () {
  return { type: LOGOUT }
}
