import type { User } from './user.types'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  access_token: string   
}

export interface RegisterRequest {
  email: string
  password: string
  profile: {
    name: string
    lastName: string
    bio?: string | null
  }
}