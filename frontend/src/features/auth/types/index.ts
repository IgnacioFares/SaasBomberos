import type {Bombero} from '../../../types'

export interface LoginRequest{
    email: string
    password: string
}

export interface RegisterRequest{
    email: string
    password: string
    bombero: Bombero
}

export interface LoginResponse{
    token: string
}

export interface Usuario {
    id: number
    email: string
    bombero: Bombero
    rol: string
    estado: string
}
