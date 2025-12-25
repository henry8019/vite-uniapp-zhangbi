const baseUrl = import.meta.env.VITE_API_BASE_URL

function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${uni.getStorageSync('token')}`,
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const resBody = res.data

          if (resBody.code === 0) {
            resolve(resBody.data)
          }
          else {
            const msg = resBody.message || resBody.detail || '操作失败'
            uni.showToast({ title: msg, icon: 'none' })
            reject(new Error(msg))
          }
        }
        else {
          const msg = res.data?.detail || res.data?.message || '请求错误'
          uni.showToast({ title: msg, icon: 'none' })
          reject(new Error(msg))
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络连接异常', icon: 'none' })
        reject(err)
      },
    })
  })
}

/**
 * 获取商户商品列表
 * @param {object} params { page, size, keyword }
 */
export function getProductListAPI(params) {
  return request({
    url: '/api/v1/merchant/products',
    method: 'GET',
    data: {
      page: params.page || 1,
      size: params.size || 20,
      keyword: params.keyword || '',
    },
  })
}

/**
 * 商户端 - 新增商品
 */
export function createProductAPI(data) {
  return request({
    url: '/api/v1/merchant/products',
    method: 'POST',
    data,
  })
}

/**
 * 商户端 - 删除商品
 * @param {string} id 商品ID
 */
export function deleteProductAPI(id) {
  return request({

    url: `/api/v1/merchant/products/${id}`,
    method: 'DELETE',
  })
}

/**
 * 商户端 - 更新商品
 * @param {string} id 商品ID
 * @param {object} data 更新的数据
 */
export function updateProductAPI(id, data) {
  return request({

    url: `/api/v1/merchant/products/${id}`,
    method: 'PUT',
    data,
  })
}

/**
 * 商户端-编辑商品信息
 * @param {string} productId
 * @param {object} data
 * @param {string} data.name
 * @param {string} data.price
 * @param {number} data.stock
 * @param {string} data.desc
 * @param {string} data.category
 * @param {string} data.image_url
 */
export function updateProduct(productId, data) {
  return request({
    url: `/api/v1/merchant/products/${productId}`,
    method: 'PUT',
    data,
  })
}

/**
 * 商户端-删除商品
 * @param {string} productId 商品ID
 */
export function deleteProduct(productId) {
  return request({
    url: `/api/v1/merchant/products/${productId}`,
    method: 'DELETE',
  })
}

/**
 * 商户端-商品详情
 * @param {string} productId 商品ID
 */
export function getProductDetail(productId) {
  return request({
    url: `/api/v1/merchant/products/${productId}`,
    method: 'GET',
  })
}
