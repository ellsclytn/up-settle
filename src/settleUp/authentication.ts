import env from 'env-var'
import firebase from 'firebase/app'
import 'firebase/auth'

export const apiUrl = 'https://settle-up-sandbox.firebaseio.com'

const firebaseConfig = {
  apiKey: 'AIzaSyCfMEZut1bOgu9d1NHrJiZ7ruRdzfKEHbk',
  authDomain: 'settle-up-sandbox.firebaseapp.com',
  databaseURL: apiUrl,
  projectId: 'settle-up-sandbox',
  storageBucket: 'settle-up-sandbox.appspot.com',
  appId: '327675517252504'
}

type Credentials = [username: string, password: string]

export interface UserAuth {
  uid: string
  token: string
}

const credentials: Credentials = [
  env.get('SETTLE_UP_USERNAME').required().asString(),
  env.get('SETTLE_UP_PASSWORD').required().asString()
]

firebase.initializeApp(firebaseConfig)

export async function getUserAuth (): Promise<UserAuth> {
  await firebase.auth().signInWithEmailAndPassword(...credentials)

  const user = firebase.auth().currentUser
  const token = await user?.getIdToken()
  const uid = user?.uid

  if (typeof token !== 'undefined' && typeof uid !== 'undefined') {
    return {
      uid,
      token
    }
  }

  throw new Error('Failed to fetch ID token')
}
