import { createContext, useState, useContext, useEffect } from 'react'

import { api } from '../services/api'


export const AuthContext = createContext({})

function AuthProvider({children}) {
  const [data, setData] = useState({})
  async function signIn({ email, password }) {
    try {
      const response = await api.post('/sessions', { email, password })
      const { user, token } = response.data

      localStorage.setItem('@foodExplorer:user', JSON.stringify(user))
      localStorage.setItem('@foodExplorer:token', token)

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setData({ user, token })
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message)
      } else {
        alert('Não foi possível entrar.')
      }
    }
  }

  function signOut() {
    localStorage.removeItem('@foodExplorer:token')
    localStorage.removeItem('@foodExplorer:user')
    setData({})
  }

  async function updateProfile({ user, avatarFile }) {
    if (avatarFile) {
      const fileUploadForm = new FormData()
      fileUploadForm.append('avatar', avatarFile)

      const response = await api.patch('/users/avatar', fileUploadForm)
      user.avatar = response.data.avatar
    }

    try {
      await api.put('/users', user)
      localStorage.setItem('@foodexplorer:user', JSON.stringify(user))

      setData({ user, token: data.token })

      alert('Perfil atualizado')
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message)
      } else {
        alert('Não foi possível entrar.')
      }
    }
  }

  async function updateDish({ meal, imgMealFile }){
    try {
        await api.put("/meals", meal);
        localStorage.setItem("@foodexplorer:meal", JSON.stringify(meal));

        setData({
            meal, 
            token: data.token 
        });

        if(imgMealFile){
            const fileUploadForm = new FormData();
            fileUploadForm.append("imgmeal", imgMealFile);

            const response = await api.patch("/meals/imgmeal", fileUploadForm);
            meal.imgmeal = response.data.imgmeal;
        }

        alert("Perfil atualizado com sucesso!");

    } catch (error) {
        if (error.response){
            alert(error.response.data.message);
        } else {
            alert("Não foi possível atualizar.")
        }
    }
}

  useEffect(() => {
    const token = localStorage.getItem('@foodexplorer:token')
    const user = localStorage.getItem('@foodexplorer:user')

    if (token && user) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      setData({
        token,
        user: JSON.parse(user),
      })
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{ signIn, signOut, updateDish, meal: data.user, user: data.user, updateProfile }}
    >
     {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext)
  return context
}

export { AuthProvider, useAuth }