import request from '@/utils/request'

let abortController = null

export function getAllGameScriptInfosAPI() {
  // 如果有未完成的请求，取消它
  if (abortController) {
    abortController.abort()
  }
  abortController = new AbortController()

  return request({
    url: '/api/v1/merchant/game/script-infos',
    method: 'GET',
    signal: abortController.signal,
  })
}

/**
 * 获取指定游戏的剧本信息
 * @param {string} gameId 游戏ID/队伍ID
 */
export function getGameScriptInfoAPI(gameId) {
  return request({
    url: `/api/v1/merchant/game/${gameId}/script-info`,
    method: 'GET',
  })
}

/**
 * 获取指定游戏的队伍成员列表
 * @param {string} gameId 游戏ID
 */
export function getGameUsersAPI(gameId) {
  return request({
    url: `/api/v1/merchant/game/${gameId}/users`,
    method: 'GET',
  })
}

/**
 * 商品核销
 * @param {string} productId 商品ID
 * @param {object} data 核销数据 { count, game_id, user_id, task_id, sub_task_id }
 */
export function redeemProductAPI(productId, data) {
  return request({
    url: `/api/v1/merchant/products/${productId}/redeem`,
    method: 'POST',
    data,
  })
}
