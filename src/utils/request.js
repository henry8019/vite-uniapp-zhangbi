import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({

  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
})

service.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    console.error('request error:', error)
    ElMessage.error('请求失败')
    return Promise.reject(error)
  },
)

service.interceptors.response.use(
  (response) => {
    const res = response.data

    if (res.code !== 1) {
      ElMessage.error(res.msg || '请求出错了')
      return Promise.reject(res)
    }
    else {
      return res
    }
  },
  (error) => {
    console.error('response error:', error)
    ElMessage.error(error.message || '服务器错误')
    return Promise.reject(error)
  },
)

export default service
