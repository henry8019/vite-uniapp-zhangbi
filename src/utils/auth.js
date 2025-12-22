// src/utils/auth.js

const baseUrl = import.meta.env.VITE_API_BASE_URL

export function loginAPI(data) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${baseUrl}/api/v1/auth/login`,
      method: 'POST',
      data,
      header: {
        'Content-Type': 'application/json',
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        }
        else {
          uni.showToast({
            title: '登录失败，请检查账号密码',
            icon: 'none',
          })
          console.error('登录失败详情:', res.data)
          reject(res.data)
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络连接失败', icon: 'none' })
        reject(err)
      },
    })
  })
}
export function setUserInfo(info) {
  uni.setStorageSync('userInfo', JSON.stringify(info))
}

// 获取用户信息
export function getUserInfo() {
  return JSON.parse(uni.getStorageSync('userInfo') || '{}')
}

// 获取用户角色
export function getUserRole() {
  return getUserInfo().role || ''
}

// 获取商户ID
export function getMerchantId() {
  return getUserInfo().merchantId || ''
}

// 获取Token
export function getToken() {
  return getUserInfo().token || ''
}
