import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginAPI } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(uni.getStorageSync('token') || '')
  const tokenType = ref(uni.getStorageSync('tokenType') || 'Bearer')
  const role = ref(uni.getStorageSync('role') || '')
  const userName = ref(uni.getStorageSync('userName') || '')

  const login = async (loginForm) => {
    const res = await loginAPI(loginForm)

    const { access_token, token_type, role: userRole } = res.data

    token.value = access_token
    tokenType.value = token_type || 'Bearer'
    role.value = userRole
    userName.value = loginForm.username

    uni.setStorageSync('token', access_token)
    uni.setStorageSync('tokenType', tokenType.value)
    uni.setStorageSync('role', userRole)
    uni.setStorageSync('userName', loginForm.username)

    return res
  }

  const logout = () => {
    token.value = ''
    tokenType.value = ''
    role.value = ''
    userName.value = ''

    uni.removeStorageSync('token')
    uni.removeStorageSync('tokenType')
    uni.removeStorageSync('role')
    uni.removeStorageSync('userName')
  }

  const getAuthHeader = () => {
    if (!token.value)
      return ''

    const type = tokenType.value
      ? tokenType.value.charAt(0).toUpperCase() + tokenType.value.slice(1)
      : 'Bearer'

    return `${type} ${token.value}`
  }

  return {
    token,
    tokenType,
    role,
    userName,
    login,
    logout,
    getAuthHeader,
  }
})
