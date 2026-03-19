
export interface Profile {
    id: number,
    name: string,
    lastName: string,
    bio: string,
    avatarPic: string | null,
    backgroundPic: string | null,
}

export interface User {
    id: number;
    email: string,
    createdAt: Date,
    updatedAt: Date,
    profile: Profile,
}