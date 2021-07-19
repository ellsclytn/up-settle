export interface UserGroupsResponse {
  [id: string]: {
    color: string
    member: string
    order: number
  }
}

export interface GroupDetailsResponse {
  convertedToCurrency: string
  inviteLink: string
  inviteLinkActive: boolean
  inviteLinkHash: string
  lastChanged: number
  minimizeDebts: boolean
  name: string
  ownerColor: string
}

export interface GroupMembersResponse {
  [id: string]: {
    active: boolean
    defaultWeight: string
    name: string
  }
}
