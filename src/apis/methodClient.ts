import { post } from "./httpClient";

export const postRegister = async(user: "Iuser") =>{

    const res = await post<"api", "Iuser">("http://127.0.0.1:3000/api/register",user)

    return res

}