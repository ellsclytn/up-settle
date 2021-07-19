import env from 'env-var'
import firebase from 'firebase/app'
import 'firebase/auth'
import { FirebaseConfig } from '../types/settleUp/authentication'

const firebaseConfig: FirebaseConfig = env
  .get('SETTLE_UP_AUTH_CONFIG')
  .required()
  .asJsonObject() as FirebaseConfig

export const apiUrl = firebaseConfig.databaseURL

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
