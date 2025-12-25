// src/api/common.js

/**
 * 导游端 - 位置上报
 * @param {object} data
 * @param {number} data.lat
 * @param {number} data.lng
 * @param {string} [data.zone_id]
 * @param {number} [data.ts]
 */
export function reportLocationAPI(data) {
  return uni.request({
    url: '/api/v1/guide/location',
    method: 'POST',
    data: {
      lat: Number(data.lat),
      lng: Number(data.lng),
      zone_id: data.zone_id || '',
      ts: data.ts || Date.now(),
    },
  })
}
