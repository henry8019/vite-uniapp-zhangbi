<!-- eslint-disable no-alert -->
<script setup>
import { onShow } from '@dcloudio/uni-app'
import { computed, onMounted, ref } from 'vue'
import CustomTabBar from '@/components/CustomTabBar/index.vue'
import { useUserStore } from '@/store/user'
import request from '@/utils/request'

const userStore = useUserStore()
const categoryOptions = ['食品', '纪念品', '酒水']
const goods = ref([])
const isLoading = ref(false)

onMounted(() => {
  fetchGoodsList()
})
onShow(() => {
  fetchGoodsList()
})

async function fetchGoodsList() {
  try {
    isLoading.value = true
    const { token, role, merchantId: storeMerchantId } = userStore
    const localMerchantId = uni.getStorageSync('merchantId')
    const currentMerchantId = storeMerchantId || localMerchantId
    const currentRole = role || uni.getStorageSync('role')

    if (!token && !currentMerchantId) {
      uni.showToast({ title: '未登录，请重新登录', icon: 'none' })
      uni.switchTab({ url: '/pages/login/index' })
      return
    }

    const params = currentRole === 'admin'
      ? { role: currentRole }
      : { merchantId: currentMerchantId }
    const url = currentRole === 'admin'
      ? '/zhangbi/api/product/list/all'
      : '/zhangbi/api/product/list'

    const res = await request({
      url,
      method: 'get',
      params,
    })
    goods.value = res.data || []
  }
  catch (error) {
    console.error('获取商品列表失败：', error)
    uni.showToast({ title: '获取商品列表失败', icon: 'none' })
    goods.value = []
  }
  finally {
    isLoading.value = false
  }
}

const searchKey = ref('')
const filteredGoods = computed(() => {
  const key = searchKey.value.trim().toLowerCase()
  return key
    ? goods.value.filter(item => item.name.toLowerCase().includes(key))
    : goods.value
})

const fileInputRef = ref(null)
const activeUploadType = ref('add')

function triggerFileUpload(type) {
  activeUploadType.value = type
  if (process.env.VUE_APP_PLATFORM === 'h5') {
    setTimeout(() => {
      fileInputRef.value?.click()
    }, 0)
  }
  else {
    chooseImage(type)
  }
}

function handleFileChange(event) {
  const file = event.target.files[0]
  if (!file)
    return

  let previewUrl = ''
  if (process.env.VUE_APP_PLATFORM === 'h5') {
    previewUrl = URL.createObjectURL(file)
  }
  else {
    console.log('')
  }

  if (activeUploadType.value === 'add') {
    console.log('')
  }
  else if (activeUploadType.value === 'edit') {
    console.log('')
  }
  event.target.value = ''
}

function chooseImage(type) {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      if (type === 'add') {
        console.log('')
      }
      else {
        console.log('')
      }
    },
  })
}

const newGoodsDataTemplate = {
  isPopupOpen: false,
  formData: {
    id: '',
    goodsId: '',
    name: '',
    price: '',
    count: '',
    classify: '',
    info: '',
    img: '',
  },
}
const newGoodsData = ref({ ...newGoodsDataTemplate })

function openAddPopup() {
  newGoodsData.value.formData = {
    ...newGoodsDataTemplate.formData,
    goodsId: '',
  }
  newGoodsData.value.isPopupOpen = true
}

function closeAddPopup() {
  newGoodsData.value.isPopupOpen = false
}

async function saveNewGoods() {
  const form = newGoodsData.value.formData
  const { merchantId: storeMerchantId, role } = userStore
  const merchantId = storeMerchantId || uni.getStorageSync('merchantId')

  if (!form.name)
    return uni.showToast({ title: '请填写商品名称', icon: 'none' })
  if (!form.price)
    return uni.showToast({ title: '请填写商品价格', icon: 'none' })
  if (!form.classify)
    return uni.showToast({ title: '请选择商品分类', icon: 'none' })
  if (!form.goodsId)
    return uni.showToast({ title: '请填写商品编号', icon: 'none' })
  if (!merchantId && role !== 'admin')
    return uni.showToast({ title: '商户信息缺失，请重新登录', icon: 'none' })

  try {
    const requestData = {
      merchantId: role === 'admin' ? form.merchantId || merchantId : merchantId,
      goodsId: form.goodsId,
      name: form.name,
      price: Number(form.price),
      count: Number(form.count) || 0,
      classify: form.classify,
      info: form.info,
      img: form.img || '',
      ingredients: '[]',
    }
    const url = '/zhangbi/api/product'

    await request({
      url,
      method: 'post',
      data: requestData,
    })
    uni.showToast({ title: '新增商品成功', icon: 'success' })
    closeAddPopup()
    fetchGoodsList()
  }
  catch (error) {
    console.error('新增商品失败：', error)
    uni.showToast({ title: '新增商品失败，请重试', icon: 'none' })
  }
}

const isEditPopupOpen = ref(false)
const editFormData = ref({})

function openEditPopup(item) {
  editFormData.value = JSON.parse(JSON.stringify(item))
  isEditPopupOpen.value = true
}

function closeEditPopup() {
  isEditPopupOpen.value = false
}

async function saveEditedGoods() {
  const form = editFormData.value
  const { merchantId: storeMerchantId, role } = userStore
  const merchantId = storeMerchantId || uni.getStorageSync('merchantId')

  if (!form.name)
    return uni.showToast({ title: '请填写商品名称', icon: 'none' })

  try {
    const requestData = {
      id: form.id,
      merchantId: role === 'admin' ? form.merchantId : merchantId,
      goodsId: form.goodsId,
      name: form.name,
      price: Number(form.price),
      count: Number(form.count),
      classify: form.classify,
      info: form.info,
      img: form.img || '',
      ingredients: form.ingredients || '[]',
    }
    const url = role === 'admin' ? '/zhangbi/api/product/admin' : '/zhangbi/api/product'

    await request({
      url,
      method: 'put',
      data: requestData,
    })
    uni.showToast({ title: '编辑商品成功', icon: 'success' })
    closeEditPopup()
    fetchGoodsList()
  }
  catch (error) {
    console.error('编辑商品失败：', error)
    uni.showToast({ title: '编辑商品失败，请重试', icon: 'none' })
  }
}

async function deleteGoods(id) {
  const { merchantId: storeMerchantId, role } = userStore
  const merchantId = storeMerchantId || uni.getStorageSync('merchantId')

  uni.showModal({
    title: '提示',
    content: '确定要删除该商品吗？此操作无法撤销。',
    async success(res) {
      if (res.confirm) {
        try {
          const params = role === 'admin'
            ? { role }
            : { merchantId }
          const url = role === 'admin'
            ? `/zhangbi/api/product/${id}/admin`
            : `/zhangbi/api/product/${id}`

          await request({
            url,
            method: 'delete',
            params,
          })
          uni.showToast({ title: '删除商品成功', icon: 'success' })
          fetchGoodsList()
        }
        catch (error) {
          console.error('删除商品失败：', error)
          uni.showToast({ title: '删除商品失败，请重试', icon: 'none' })
        }
      }
    },
  })
}
</script>

<template>
  <view class="min-h-screen bg-gray-100 pb-32 font-sans text-gray-800">
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />

    <view class="pt-12 px-4 pb-4 flex justify-between items-center bg-white sticky top-0 z-40 shadow-sm">
      <view class="flex items-end gap-2">
        <text class="text-xl font-black text-gray-900 tracking-tight">
          张壁商铺
        </text>
        <view class="bg-indigo-100 text-indigo-600 text-xs px-1.5 py-0.5 rounded font-bold">
          {{ userStore.role === 'admin' ? '管理员' : '商户' }}
        </view>
      </view>
      <view class="flex items-center gap-3">
        <view class="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-bold border border-purple-100 flex items-center gap-1">
          📦 库存模式
        </view>
      </view>
    </view>

    <view class="p-4 space-y-4">
      <view class="bg-slate-800 rounded-2xl p-5 shadow-xl text-white relative overflow-hidden">
        <view class="absolute -right-4 -top-4 opacity-10 text-9xl rotate-12 pointer-events-none">
          🛍️
        </view>

        <view class="relative z-10 flex gap-4 items-start">
          <view class="w-16 h-16 rounded-xl bg-indigo-500 flex items-center justify-center text-3xl font-bold border-2 border-indigo-400/30 shadow-lg shrink-0">
            {{ userStore.role === 'admin' ? '管' : '商' }}
          </view>

          <view class="flex-1">
            <view class="text-[10px] text-indigo-300 font-bold tracking-wider mb-1">
              当前操作身份
            </view>
            <view class="text-xl font-bold mb-2 flex items-center gap-2">
              {{ userStore.role === 'admin' ? '系统管理员' : '认证商户' }}
              <span class="text-sm font-normal text-gray-400">({{ filteredGoods.length }} 件商品)</span>
            </view>
            <view class="bg-black/20 rounded-lg p-2 text-xs leading-relaxed text-gray-300 border-l-2 border-indigo-500">
              状态：系统运行正常，您可以随时管理下方的商品库存与价格。
            </view>
          </view>
        </view>
      </view>

      <view class="bg-white border border-indigo-50 rounded-xl px-4 py-2 flex items-center shadow-sm">
        <view class="text-lg mr-3 opacity-50">
          🔍
        </view>
        <input
          v-model="searchKey"
          placeholder="搜索商品名称..."
          class="flex-1 bg-transparent outline-none text-gray-800 text-sm placeholder:text-gray-400 h-10"
          type="text"
        />
        <view v-if="searchKey" class="text-gray-400" @click="searchKey = ''">
          <view class="i-carbon-close-filled"></view>
        </view>
      </view>

      <view
        class="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-4 text-white flex justify-between items-center shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-transform cursor-pointer"
        @click="openAddPopup"
      >
        <view class="flex items-center gap-3">
          <view class="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center text-xl">
            ✨
          </view>
          <view class="flex flex-col">
            <text class="font-bold text-lg">
              录入新商品
            </text>
            <text class="text-indigo-100 text-xs">
              点击登记入库
            </text>
          </view>
        </view>
        <view class="text-white/80 text-xl font-bold">
          ＋
        </view>
      </view>

      <view v-if="isLoading" class="flex flex-col items-center justify-center py-10 text-gray-400">
        <view class="i-carbon-loading text-4xl mb-2 opacity-50 animate-spin"></view>
        <span class="text-xs font-bold tracking-widest">正在清点物资...</span>
      </view>

      <view v-else-if="filteredGoods.length === 0" class="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-50">
        <view class="text-4xl mb-3">
          📦
        </view>
        <view class="text-gray-400 text-sm font-medium">
          暂无相关物资数据
        </view>
      </view>

      <view class="space-y-4">
        <view
          v-for="item in filteredGoods" :key="item.id"
          class="bg-white rounded-2xl p-4 shadow-sm relative border border-gray-50 flex gap-4"
        >
          <view class="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-inner relative group">
            <image :src="item.img || ''" mode="aspectFill" class="w-full h-full object-cover" />
            <view v-if="!item.img" class="absolute inset-0 flex items-center justify-center text-gray-300 text-2xl">
              🖼️
            </view>
          </view>

          <view class="flex-1 min-w-0 flex flex-col justify-between">
            <view>
              <view class="flex justify-between items-start">
                <view class="text-gray-900 font-bold text-lg leading-tight truncate pr-2">
                  {{ item.name }}
                </view>
                <view class="text-indigo-600 font-black text-lg font-sans">
                  <span class="text-xs font-bold align-top">¥</span>{{ item.price }}
                </view>
              </view>

              <view class="flex flex-wrap gap-2 mt-2">
                <span v-if="item.classify" class="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold border border-orange-100">
                  {{ item.classify }}
                </span>
                <span class="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold">
                  库存: {{ item.count }}
                </span>
                <span v-if="userStore.role === 'admin' && item.merchantId" class="bg-blue-50 text-blue-500 px-2 py-0.5 rounded text-[10px] font-bold">
                  商户号: {{ item.merchantId }}
                </span>
              </view>
            </view>

            <view class="flex justify-end gap-2 mt-3">
              <button
                class="bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1 border-0 transition-colors"
                @click.stop="openEditPopup(item)"
              >
                📝 编辑
              </button>
              <button
                class="bg-red-50 hover:bg-red-100 text-red-500 text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1 border-0 transition-colors"
                @click.stop="deleteGoods(item.id)"
              >
                🗑️ 删除
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view
      v-if="newGoodsData.isPopupOpen || isEditPopupOpen"
      class="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-sm transition-opacity"
    ></view>

    <view v-if="newGoodsData.isPopupOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <view class="bg-white w-full max-w-sm rounded-3xl shadow-2xl flex flex-col max-h-[85vh] pointer-events-auto overflow-hidden animate-pop-in">
        <view class="bg-indigo-600 p-4 pt-5 pb-8 flex justify-between items-center text-white relative">
          <h3 class="font-bold text-xl relative z-10">
            新增物资
          </h3>
          <view class="absolute -right-2 -bottom-6 text-indigo-500 text-6xl opacity-30 rotate-12">
            📝
          </view>
          <button class="text-white/70 p-1 hover:text-white z-10" @click="closeAddPopup">
            <view class="i-carbon-close text-2xl"></view>
          </button>
        </view>

        <view class="bg-white -mt-4 rounded-t-3xl px-5 pt-6 pb-5 overflow-y-auto space-y-4 flex-1">
          <div class="flex justify-center mb-4">
            <div v-if="newGoodsData.formData.img" class="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-indigo-100 shadow-md">
              <image :src="newGoodsData.formData.img" class="w-full h-full object-cover" />
              <button class="absolute top-1 right-1 bg-black/60 text-white w-6 h-6 flex items-center justify-center rounded-full" @click="removeImage('add')">
                ✕
              </button>
            </div>
            <div v-else class="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400 cursor-pointer active:scale-95 transition-all" @click="triggerFileUpload('add')">
              <view class="text-2xl mb-1">
                📷
              </view>
              <span class="text-xs font-bold">上传封面</span>
            </div>
          </div>

          <div class="space-y-3">
            <div v-if="userStore.role === 'admin'">
              <label class="text-xs text-gray-500 font-bold ml-1">商户编号</label>
              <input v-model="newGoodsData.formData.merchantId" class="modern-input" placeholder="输入商户ID" />
            </div>

            <div>
              <label class="text-xs text-gray-500 font-bold ml-1">商品名称</label>
              <input v-model="newGoodsData.formData.name" class="modern-input" placeholder="请输入名称" />
            </div>

            <div>
              <label class="text-xs text-gray-500 font-bold ml-1">商品条码</label>
              <input v-model="newGoodsData.formData.goodsId" class="modern-input" placeholder="请输入条码" />
            </div>

            <div class="flex gap-3">
              <div class="flex-1">
                <label class="text-xs text-gray-500 font-bold ml-1">销售价格</label>
                <input v-model="newGoodsData.formData.price" type="number" class="modern-input" placeholder="¥ 0.00" />
              </div>
              <div class="flex-1">
                <label class="text-xs text-gray-500 font-bold ml-1">库存数量</label>
                <input v-model="newGoodsData.formData.count" type="number" class="modern-input" placeholder="0" />
              </div>
            </div>

            <div class="relative">
              <label class="text-xs text-gray-500 font-bold ml-1">所属分类</label>
              <select v-model="newGoodsData.formData.classify" class="modern-input appearance-none bg-transparent">
                <option value="" disabled>
                  请选择分类
                </option>
                <option v-for="opt in categoryOptions" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>
              <view class="absolute right-3 top-[30px] text-gray-400 pointer-events-none">
                ▼
              </view>
            </div>

            <div>
              <label class="text-xs text-gray-500 font-bold ml-1">商品描述</label>
              <textarea v-model="newGoodsData.formData.info" class="modern-input h-20 py-2 resize-none" placeholder="输入详情..."></textarea>
            </div>
          </div>
        </view>

        <view class="p-5 border-t border-gray-50 bg-gray-50 flex gap-3">
          <button class="flex-1 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold text-sm shadow-sm active:scale-95 transition-transform" @click="closeAddPopup">
            取消
          </button>
          <button class="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-transform" @click="saveNewGoods">
            确认入库
          </button>
        </view>
      </view>
    </view>

    <view v-if="isEditPopupOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <view class="bg-white w-full max-w-sm rounded-3xl shadow-2xl flex flex-col max-h-[85vh] pointer-events-auto overflow-hidden animate-pop-in">
        <view class="bg-slate-800 p-4 pt-5 pb-8 flex justify-between items-center text-white relative">
          <h3 class="font-bold text-xl relative z-10">
            编辑信息
          </h3>
          <button class="text-white/70 p-1 hover:text-white z-10" @click="closeEditPopup">
            <view class="i-carbon-close text-2xl"></view>
          </button>
        </view>

        <view class="bg-white -mt-4 rounded-t-3xl px-5 pt-6 pb-5 overflow-y-auto space-y-4 flex-1">
          <div class="flex justify-center mb-4" @click="triggerFileUpload('edit')">
            <div class="relative w-28 h-28 rounded-2xl overflow-hidden border border-gray-200 shadow-sm group">
              <image :src="editFormData.img || ''" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="text-white text-xs font-bold border border-white/50 px-3 py-1 rounded-full">点击更换</span>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <div v-if="userStore.role === 'admin'">
              <label class="text-xs text-gray-500 font-bold ml-1">商户编号</label>
              <input v-model="editFormData.merchantId" class="modern-input bg-gray-200 text-gray-500" disabled />
            </div>

            <div>
              <label class="text-xs text-gray-500 font-bold ml-1">商品名称</label>
              <input v-model="editFormData.name" class="modern-input" />
            </div>

            <div>
              <label class="text-xs text-gray-500 font-bold ml-1">商品条码</label>
              <input v-model="editFormData.goodsId" class="modern-input" />
            </div>

            <div class="flex gap-3">
              <div class="flex-1">
                <label class="text-xs text-gray-500 font-bold ml-1">销售价格</label>
                <input v-model="editFormData.price" type="number" class="modern-input" />
              </div>
              <div class="flex-1">
                <label class="text-xs text-gray-500 font-bold ml-1">库存数量</label>
                <input v-model="editFormData.count" type="number" class="modern-input" />
              </div>
            </div>
            <div class="relative">
              <label class="text-xs text-gray-500 font-bold ml-1">所属分类</label>
              <select v-model="editFormData.classify" class="modern-input appearance-none">
                <option v-for="opt in categoryOptions" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>
              <view class="absolute right-3 top-[30px] text-gray-400 pointer-events-none">
                ▼
              </view>
            </div>

            <div>
              <label class="text-xs text-gray-500 font-bold ml-1">商品描述</label>
              <textarea v-model="editFormData.info" class="modern-input h-20 py-2 resize-none"></textarea>
            </div>
          </div>
        </view>

        <view class="p-5 border-t border-gray-50 bg-gray-50 flex gap-3">
          <button class="flex-1 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold text-sm shadow-sm active:scale-95 transition-transform" @click="closeEditPopup">
            放弃
          </button>
          <button class="flex-1 py-3 rounded-xl bg-slate-800 text-white font-bold text-sm shadow-lg shadow-gray-400/50 active:scale-95 transition-transform" @click="saveEditedGoods">
            保存修改
          </button>
        </view>
      </view>
    </view>

    <CustomTabBar :current="1" />
  </view>
</template>

<style scoped>
.modern-input {
  @apply w-full bg-gray-100 text-gray-800 text-sm font-bold rounded-xl px-4 py-3 outline-none border-2 border-transparent focus:border-indigo-200 focus:bg-white transition-all mt-1;
}

@keyframes pop-in {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-pop-in {
  animation: pop-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
