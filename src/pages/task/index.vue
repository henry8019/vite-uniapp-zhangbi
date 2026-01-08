<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getGameScriptInfoAPI, getGameUsersAPI, redeemProductAPI } from '@/api/merchant_game'
import CustomTabBar from '@/components/CustomTabBar/index.vue'
import { useMerchantStore } from '@/store/merchant'

const merchantStore = useMerchantStore()
let pollingTimer = null

const selectedTeamIndex = ref(-1)
const scriptInfo = ref(null)
const loading = ref(false)

// 队伍成员相关状态
const teamUsers = ref([])
const selectedUserIndex = ref(-1)

// 从商户store中获取队伍列表
const teamList = computed(() => {
  const infos = merchantStore.gameScriptInfos || []
  return infos.map(item => ({
    game_id: item.game_id,
    team_name: item.team_info?.team_name || '未知队伍',
    script_name: item.script_name,
    team_id: item.team_info?.team_id || item.game_id,
  }))
})

// 当前选中的成员显示文本
const selectedUserText = computed(() => {
  if (selectedUserIndex.value >= 0 && teamUsers.value[selectedUserIndex.value]) {
    const user = teamUsers.value[selectedUserIndex.value]
    return user.username || user.user_id
  }
  return '请选择成员'
})

// 队伍选择变化
async function onTeamChange(e) {
  const index = e.detail.value
  selectedTeamIndex.value = index

  // 重置成员选择
  teamUsers.value = []
  selectedUserIndex.value = -1

  if (index < 0 || index >= teamList.value.length) {
    scriptInfo.value = null
    return
  }

  const gameId = teamList.value[index].game_id

  loading.value = true
  try {
    // 并行获取剧本信息和队伍成员
    const [scriptRes, usersRes] = await Promise.all([
      getGameScriptInfoAPI(gameId),
      getGameUsersAPI(gameId),
    ])

    scriptInfo.value = scriptRes
    console.log('剧本信息:', scriptRes)

    if (usersRes && Array.isArray(usersRes)) {
      teamUsers.value = usersRes
      console.log('队伍成员列表:', usersRes)
      console.log('成员数量:', usersRes.length)

      // 默认选择第一个成员
      if (usersRes.length > 0) {
        selectedUserIndex.value = 0
        console.log('默认选中第一个成员:', usersRes[0])
      }
    }
    else {
      console.warn('队伍成员数据格式不正确:', usersRes)
    }
  }
  catch (error) {
    console.error('获取数据失败:', error)
    uni.showToast({ title: '获取数据失败', icon: 'none' })
    scriptInfo.value = null
  }
  finally {
    loading.value = false
  }
}

// 成员选择变化
function onUserChange(e) {
  const index = Number(e.detail.value)
  selectedUserIndex.value = index
  console.log('选择成员索引:', index)
  console.log('选择的成员:', teamUsers.value[index])
}

// 处理商品核销
async function handleRedeemProduct(merchantInfo) {
  // 检查是否选择了成员
  if (selectedUserIndex.value < 0 || !teamUsers.value[selectedUserIndex.value]) {
    uni.showToast({ title: '请先选择队伍成员', icon: 'none' })
    return
  }

  const selectedUser = teamUsers.value[selectedUserIndex.value]
  const selectedUserId = selectedUser.user_id
  const selectedUserName = selectedUser.username || selectedUser.user_id
  const gameId = teamList.value[selectedTeamIndex.value].game_id

  if (!scriptInfo.value || !scriptInfo.value.merchant_infos[0].product_id) {
    uni.showToast({ title: '未找到商品信息', icon: 'none' })
    return
  }
  console.log(merchantInfo)
  uni.showModal({
    title: '确认核销',
    content: `成员: ${selectedUserName}\n商品: ${merchantInfo.selected_item} x${merchantInfo.selected_item_count}\n\n确定要核销该商品吗？`,
    confirmText: '确认核销',
    confirmColor: '#9333ea',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '核销中...', mask: true })
        try {
          await redeemProductAPI(scriptInfo.value.merchant_infos[0].product_id, {
            count: merchantInfo.selected_item_count || 1,
            game_id: gameId,
            user_id: selectedUserId,
            task_id: merchantInfo.task_id || scriptInfo.value.task_id,
            sub_task_id: scriptInfo.value.sub_task_id || '',
          })
          uni.hideLoading()
          uni.showToast({ title: '核销成功！', icon: 'success' })

          // 刷新剧本信息
          const scriptRes = await getGameScriptInfoAPI(gameId)
          scriptInfo.value = scriptRes
        }
        catch (error) {
          uni.hideLoading()

          // 处理特殊错误：游戏还没有进行到该任务
          if (error.code === 40002 || (error.message && error.message.includes('游戏还没有进行到该任务'))) {
            uni.showModal({
              title: '无法核销',
              content: error.message || '游戏还没有进行到该任务阶段，请等待游戏进度',
              showCancel: false,
              confirmText: '我知道了',
              confirmColor: '#f59e0b',
            })
          }
          else {
            uni.showToast({
              title: `核销失败: ${error.message || error}`,
              icon: 'none',
              duration: 3000,
            })
          }
        }
      }
    },
  })
}

// 每10秒获取一次剧本信息数据
onMounted(() => {
  merchantStore.getAllGameScriptInfos()
  pollingTimer = setInterval(() => {
    merchantStore.getAllGameScriptInfos()
  }, 10000)
})

// 页面销毁时清除定时器
onUnmounted(() => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
  }
})

function handleDeliver(merchantInfo) {
  uni.showToast({ title: '线索已交付', icon: 'success' })
}

function resetTask() {
  uni.showModal({
    title: '重置任务',
    content: '确定要跳过当前剧本节点吗？',
    success(res) {
      if (res.confirm) {
        uni.showToast({ title: '已重置', icon: 'none' })
      }
    },
  })
}
</script>

<template>
  <view class="min-h-screen bg-gray-100 pb-32 font-sans text-gray-800">
    <view class="pt-12 px-4 pb-4 flex justify-between items-center bg-white sticky top-0 z-40 shadow-sm">
      <view class="flex items-end gap-2">
        <text class="text-xl font-black text-gray-900">
          Merchant OS
        </text>
        <view class="bg-indigo-100 text-indigo-600 text-xs px-1.5 py-0.5 rounded font-bold">
          v2.1
        </view>
      </view>
      <view class="flex items-center gap-3">
        <view class="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-bold border border-purple-100 flex items-center gap-1">
          🎭 剧本模式
        </view>
        <view class="text-gray-400 text-lg">
          ⚙️
        </view>
      </view>
    </view>

    <view class="p-4 space-y-4">
      <!-- 队伍选择下拉框 -->
      <view class="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
        <view class="text-sm text-gray-500 mb-2 font-bold">
          选择队伍
        </view>
        <picker mode="selector" :range="teamList" range-key="team_name" :value="selectedTeamIndex" @change="onTeamChange">
          <view class="bg-gray-50 rounded-lg px-4 py-3 flex justify-between items-center border border-gray-200">
            <text class="text-gray-800">
              {{ selectedTeamIndex >= 0 ? teamList[selectedTeamIndex]?.team_name : '请选择队伍' }}
            </text>
            <text class="text-gray-400">
              ▼
            </text>
          </view>
        </picker>
      </view>

      <!-- 队伍成员选择下拉框 -->
      <view v-if="selectedTeamIndex >= 0 && teamUsers.length > 0" class="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
        <view class="text-sm text-gray-500 mb-2 font-bold">
          👥 选择队伍成员
        </view>
        <picker mode="selector" :range="teamUsers" range-key="username" :value="selectedUserIndex" @change="onUserChange">
          <view class="bg-purple-50 rounded-lg px-4 py-3 flex justify-between items-center border-2 border-purple-200">
            <text class="text-gray-800 font-medium">
              {{ selectedUserText }}
            </text>
            <text class="text-purple-400">
              ▼
            </text>
          </view>
        </picker>
        <view class="mt-2 text-xs text-gray-400">
          用于核销商品时指定接收成员 (共{{ teamUsers.length }}人)
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="bg-white rounded-2xl p-6 shadow-sm text-center">
        <text class="text-gray-500">
          加载中...
        </text>
      </view>

      <!-- 未选择队伍时的提示 -->
      <view v-if="!scriptInfo && !loading && selectedTeamIndex < 0" class="bg-gray-50 rounded-2xl p-8 text-center">
        <view class="text-6xl mb-4">
          🎭
        </view>
        <text class="text-gray-500 text-sm">
          请选择队伍查看剧本信息
        </text>
      </view>

      <!-- 剧本信息展示 -->
      <template v-if="scriptInfo && !loading">
        <!-- 剧本基本信息 -->
        <view class="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-5 shadow-xl text-white">
          <view class="flex items-center justify-between mb-3">
            <view class="flex items-center gap-2">
              <text class="text-2xl">
                📜
              </text>
              <text class="text-lg font-bold">
                {{ scriptInfo.script_name }}
              </text>
            </view>
            <view class="bg-white/20 px-3 py-1 rounded-full text-xs">
              {{ scriptInfo.game_state === 'created' ? '已创建' : scriptInfo.game_state }}
            </view>
          </view>
          <text class="text-xs text-purple-200 font-mono">
            游戏ID: {{ scriptInfo.game_id }}
          </text>
        </view>

        <!-- 商户信息列表 -->
        <view v-for="(merchant, index) in scriptInfo.merchant_infos" :key="merchant.merchant_id" class="space-y-3">
          <view class="bg-slate-800 rounded-2xl p-5 shadow-xl text-white relative overflow-hidden">
            <view class="absolute -right-4 -top-4 opacity-10 text-9xl rotate-12 pointer-events-none">
              {{ index === 0 ? '⚡' : '🎭' }}
            </view>

            <view class="relative z-10 flex gap-4 items-start">
              <view class="w-16 h-16 rounded-xl bg-indigo-500 flex items-center justify-center text-3xl font-bold border-2 border-indigo-400/30 shadow-lg shrink-0">
                {{ merchant.npc.substring(0, 1) }}
              </view>

              <view class="flex-1">
                <view class="text-[10px] text-indigo-300 font-bold tracking-wider uppercase mb-1">
                  Current Role
                </view>
                <view class="text-xl font-bold mb-2 flex items-center gap-2">
                  {{ merchant.npc }}
                  <span class="text-sm font-normal text-gray-400">({{ merchant.npc_role }})</span>
                </view>

                <view class="bg-black/20 rounded-lg p-3 text-xs leading-relaxed text-gray-300 border-l-2 border-indigo-500 space-y-2">
                  <view>
                    <text class="text-indigo-300 font-bold">
                      推荐商品：
                    </text>
                    <text>{{ merchant.selected_item }} × {{ merchant.selected_item_count }}</text>
                  </view>
                  <view>
                    <text class="text-indigo-300 font-bold">
                      价格：
                    </text>
                    <text>¥{{ merchant.price }}</text>
                  </view>
                  <view v-if="merchant.task_id">
                    <text class="text-indigo-300 font-bold">
                      任务ID：
                    </text>
                    <text>{{ merchant.task_id }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- NPC对话 -->
          <view class="bg-white rounded-2xl p-6 shadow-sm relative border border-gray-50">
            <view class="absolute top-4 left-4 text-6xl text-gray-100 font-serif leading-none">
              "
            </view>

            <view class="flex justify-center mb-4">
              <text class="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase">
                NPC Dialogue
              </text>
            </view>

            <view class="relative z-10 px-2">
              <text class="text-base text-gray-800 leading-relaxed block">
                {{ merchant.npc_dialogue }}
              </text>
              <view class="absolute bottom-0 right-0 text-6xl text-gray-100 font-serif leading-none rotate-180">
                "
              </view>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="space-y-3">
            <view
              class="rounded-xl p-4 text-white flex justify-between items-center shadow-lg active:scale-[0.98] transition-transform"
              :class="merchant.is_write_off ? 'bg-gray-400' : 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-purple-500/20'"
              @click="!merchant.is_write_off && handleRedeemProduct(merchant)"
            >
              <view class="flex items-center gap-3">
                <view class="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center text-xl">
                  {{ merchant.is_write_off ? '✓' : '🎒' }}
                </view>
                <view class="flex flex-col">
                  <text class="font-bold text-lg">
                    {{ merchant.is_write_off ? '已核销' : `核销：${merchant.selected_item} x${merchant.selected_item_count}` }}
                  </text>
                </view>
              </view>
              <view class="text-white/80 text-xl">
                ›
              </view>
            </view>

            <view
              class="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-4 text-white flex justify-between items-center shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-transform"
              @click="handleDeliver(merchant)"
            >
              <view class="flex items-center gap-3">
                <view class="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center text-xl">
                  🗝️
                </view>
                <view class="flex flex-col">
                  <text class="font-bold text-lg">
                    交付线索
                  </text>
                </view>
              </view>
              <view class="text-white/80 text-xl">
                ›
              </view>
            </view>
          </view>
        </view>
      </template>
    </view>

    <CustomTabBar :current="1" />
  </view>
</template>

<style scoped>
/* 可以在这里添加特殊的字体样式，如果需要衬线体 */
</style>
