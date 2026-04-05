import { useEffect } from 'react'
import useAuthStore from '@/store/auth.store'
import api from '@/lib/axios'
import type { User } from '@/types/user.types'

const useAuth = () => {
  const { user, token, setUser } = useAuthStore()

  useEffect(() => {
        const fetchProfile = async () => {
            try {
                console.log('token:', token)
                console.log('user:', user)
                console.log('user.profile:', user?.profile)
                // only fetch if we have a token and user but no profile yet
                if (token && user && !user.profile) {
                    // fetch profile here
                    const profileResponse = await api.get<User['profile']>(`/users/${user.id}/profile`);
                    const profileData = profileResponse.data;
                    if (!profileData) return
                    // update user in store
                    setUser({
                        ...user,           
                        profile:  {          
                            id: profileData.id,
                            name: profileData.name,
                            lastName: profileData.lastName,
                            bio: profileData.bio,
                            avatarPic: profileData.avatarPic,
                            backgroundPic: profileData.backgroundPic,
                        }
                    })
                }
            } catch (error){
                console.error("Error fetching profile", error)
            }  
    }
    fetchProfile()
  }, [token, user?.id])

  return { user, token }
}

export default useAuth