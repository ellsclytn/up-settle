import axios, { AxiosInstance } from 'axios'
import {
  GroupDetailsResponse,
  GroupMembersResponse,
  UserGroupsResponse
} from '../types/settleUp/api'
import { apiUrl, UserAuth } from './authentication'

export interface SettleUpTransactionRequest {
  group: string
  user: string
  amount: string
}

export class SettleUpApi {
  readonly client: AxiosInstance
  readonly uid: string

  constructor (userAuth: UserAuth) {
    const client = axios.create({
      baseURL: apiUrl,
      params: {
        auth: userAuth.token
      }
    })

    this.client = client
    this.uid = userAuth.uid
  }

  async addTransaction ({
    group,
    user,
    amount
  }: SettleUpTransactionRequest): Promise<void> {
    const groupId = await this.getGroupByName(group)
    const members = await this.getGroupMembers(groupId)

    const payer = Object.entries(members).find(
      ([_id, { name }]) => user === name
    )

    if (typeof payer === 'undefined') {
      throw new Error(`Failed to find member named ${user}`)
    }

    const [payerId, { defaultWeight }] = payer

    await this.client.post(`/transactions/${groupId}.json`, {
      dateTime: Date.now(),
      currencyCode: 'AUD',
      fixedExchangeRate: true,
      items: [
        {
          amount: amount.replace('-', ''),
          forWhom: Object.entries(members).map(([id, { defaultWeight }]) => ({
            memberId: id,
            weight: defaultWeight
          }))
        }
      ],
      purpose: 'VPN',
      type: 'expense',
      whoPaid: [
        {
          memberId: payerId,
          weight: defaultWeight
        }
      ]
    })
  }

  private async getGroupMembers (id: string): Promise<GroupMembersResponse> {
    const { data } = await this.client.get<GroupMembersResponse>(
      `/members/${id}.json`
    )

    return data
  }

  private async getGroupByName (name: string): Promise<string> {
    const groups = await this.getUserGroups()

    const idFound = Object.keys(groups).find(async (id) => {
      const group = await this.getGroupDetails(id)
      return name === group.name
    })

    if (typeof idFound === 'string') {
      return idFound
    }

    throw new Error(`Failed to find group matching ${name}`)
  }

  private async getGroupDetails (id: string): Promise<GroupDetailsResponse> {
    const { data } = await this.client.get<GroupDetailsResponse>(
      `/groups/${id}.json`
    )

    return data
  }

  private async getUserGroups (): Promise<UserGroupsResponse> {
    const { data } = await this.client.get<UserGroupsResponse>(
      `/userGroups/${this.uid}.json`
    )

    return data
  }
}
