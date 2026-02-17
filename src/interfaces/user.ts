export interface Iuser {
    id: number;
    email: string,
    password: string
}

export interface Iregister {
    id: number;
    name: string,
    lasName: string
    created_at: string;
    updated_at: string;
    email: string;
    password: string;
    avatarPic: string;
}

export interface Iprofile {
    bio: string;
    avatarPic: string;
}

export interface ApiResponse {
  user: Iregister;
  token: string;
}