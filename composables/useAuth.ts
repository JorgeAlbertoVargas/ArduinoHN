import { useState } from '#app'

export interface User {
  id: number
  email: string
  full_name: string
  role: string
  preferences?: any
}

export const useAuth = () => {
  const user = useState<User | null>('user', () => null)
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isEmployee = computed(() => user.value?.role === 'empleado' || user.value?.role === 'admin')

  const fetchUser = async () => {
    try {
      const data = await $fetch<{ user: User }>('/api/auth/me')
      user.value = data.user
    } catch (error) {
      user.value = null
    }
  }

  const login = async (credentials: any) => {
    try {
      const data = await $fetch<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: credentials
      })
      await fetchUser()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.data?.statusMessage || 'Error de inicio de sesión' }
    }
  }

  const register = async (userData: any) => {
    try {
      const data = await $fetch<{ user: User }>('/api/auth/register', {
        method: 'POST',
        body: userData
      })
      await fetchUser()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.data?.statusMessage || 'Error en el registro' }
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error', error)
    } finally {
      user.value = null
    }
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    isEmployee,
    fetchUser,
    login,
    register,
    logout
  }
}
