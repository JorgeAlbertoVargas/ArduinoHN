import { useRuntimeConfig } from '#imports'

export function fixNocoDBDate(dateString: string | Date | number): string {
  if (!dateString) return new Date().toISOString()
  try {
    const d = new Date(dateString)
    d.setHours(d.getHours() - 3)
    return d.toISOString()
  } catch(e) {
    return new Date().toISOString()
  }
}

export const fetchNocoDB = async (tableId: string, path: string = '', options: any = {}) => {
  const config = useRuntimeConfig()
  const { nocodbUrl, nocodbToken } = config.public

  const url = `${nocodbUrl}api/v2/tables/${tableId}/records${path}`
  
  const headers = {
    'xc-token': nocodbToken,
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  const response = await $fetch(url, {
    ...options,
    headers
  })

  return response
}

// User-specific NocoDB operations
export const findUserByEmail = async (email: string) => {
  const config = useRuntimeConfig()
  try {
    const response: any = await fetchNocoDB(config.public.nocodbUsersTable, `?where=(email,eq,${email})`)
    if (response && response.list && response.list.length > 0) {
      return response.list[0]
    }
    return null
  } catch (error) {
    console.error('Error finding user by email:', error)
    return null
  }
}

export const findUserByResetToken = async (token: string) => {
  const config = useRuntimeConfig()
  try {
    const response: any = await fetchNocoDB(config.public.nocodbUsersTable, `?where=(reset_password_token,eq,${token})`)
    if (response && response.list && response.list.length > 0) {
      return response.list[0]
    }
    return null
  } catch (error) {
    console.error('Error finding user by reset token:', error)
    return null
  }
}

export const findUserById = async (id: number) => {
  const config = useRuntimeConfig()
  try {
    const response: any = await fetchNocoDB(config.public.nocodbUsersTable, `/${id}`)
    return response
  } catch (error) {
    console.error('Error finding user by id:', error)
    return null
  }
}

export const createUser = async (userData: any) => {
  const config = useRuntimeConfig()
  try {
    const response = await fetchNocoDB(config.public.nocodbUsersTable, '', {
      method: 'POST',
      body: userData
    })
    return response
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export const updateUser = async (id: number, userData: any) => {
  const config = useRuntimeConfig()
  try {
    const response = await fetchNocoDB(config.public.nocodbUsersTable, '', {
      method: 'PATCH',
      body: {
        Id: id,
        id: id,
        ...userData
      }
    })
    return response
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export const getAllUsers = async () => {
  const config = useRuntimeConfig()
  try {
    const response: any = await fetchNocoDB(config.public.nocodbUsersTable, '?limit=100')
    return response.list || []
  } catch (error) {
    console.error('Error getting all users:', error)
    return []
  }
}
