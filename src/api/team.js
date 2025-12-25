/* eslint-disable no-undef */
const baseUrl = import.meta.env.VITE_API_BASE_URL

export function createTeamAPI(data) {
  return new Promise((resolve, reject) => {
    console.log('发起创建队伍请求:', data)

    uni.request({
      url: `${baseUrl}/api/v1/guide/team/create`,
      method: 'POST',
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${uni.getStorageSync('token')}`,
      },
      success: (res) => {
        console.log(' 接口返回:', res)

        if (res.statusCode >= 200 && res.statusCode < 300) {
          const resBody = res.data

          if (resBody.code === 0) {
            resolve(resBody.data)
          }
          else {
            const msg = resBody.message || resBody.detail
            uni.showToast({ title: msg, icon: 'none' })
            reject(new Error(msg))
          }
        }
        else {
          const msg = res.data?.detail
          uni.showToast({ title: msg, icon: 'none' })
          reject(new Error(msg))
        }
      },
      fail: (err) => {
        console.error('网络请求失败:', err)
        uni.showToast({ title: '网络连接超时', icon: 'none' })
        reject(err)
      },
    })
  })
}

/**
 * 导游端 - 修改队伍状态
 * @param {string} teamId 队伍ID
 * @param {number} statusId 状态ID (0:未开始, 1:进行中, 2:已结束)
 */
export function updateTeamStatusAPI(teamId, statusId) {
  const statusMap = {
    0: '未开始',
    1: '进行中',
    2: '已结束',
  }

  return request({
    url: `/api/v1/guide/team/${teamId}/status`,
    method: 'PUT',
    data: {
      status_id: statusId,
      status: statusMap[statusId] || '',
    },
  })
}
// TODO
export function getTeamListAPI() {
  console.log('todo:拿队伍列表')
}
