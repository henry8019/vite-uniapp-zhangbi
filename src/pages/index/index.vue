<script setup>
import { ref } from 'vue'
import CustomTabBar from '@/components/CustomTabBar/index.vue'

const currentView = ref('dashboard')

const flowList = ref([
  {
    id: 1,
    teamName: '飞虎队',
    peopleCount: 5,
    taskName: '寻找粮仓钥匙',
    arrivalTime: 3,
    tags: [{ label: '⚠️ 坚果过敏', type: 'warning' }],
  },
  {
    id: 2,
    teamName: '探险小分队',
    peopleCount: 3,
    taskName: '购买补给',
    arrivalTime: 12,
    tags: [],
  },
  {
    id: 3,
    teamName: '历史研学团',
    peopleCount: 12,
    taskName: '参观壁画',
    arrivalTime: 25,
    tags: [{ label: '👨‍🦽 轮椅需求', type: 'info' }],
  },
])

const teamList = ref([
  { id: 101, name: '飞虎队', script: '粮仓奇遇记', status: 'running', count: 5 },
  { id: 102, name: '无敌暴龙战队', script: '古城大逃亡', status: 'paused', count: 4 },
  { id: 103, name: '快乐一家人', script: '寻找消失的宝藏', status: 'finished', count: 3 },
  { id: 104, name: '公司团建A组', script: '粮仓奇遇记', status: 'running', count: 10 },
  { id: 105, name: '周末游击队', script: '未知剧本', status: 'waiting', count: 2 },
  { id: 106, name: '测试队伍001', script: '系统调试', status: 'offline', count: 1 },
])

function getTimeColor(time) {
  if (time <= 5)
    return 'bg-red-100 text-red-500'
  if (time <= 15)
    return 'bg-gray-100 text-gray-600'
  return 'bg-gray-100 text-gray-400'
}

function getTagColor(type) {
  if (type === 'warning')
    return 'bg-red-50 border-red-100 text-red-500'
  if (type === 'info')
    return 'bg-orange-50 border-orange-100 text-orange-500'
  return 'bg-gray-50 border-gray-200 text-gray-500'
}

function getStatusConfig(status) {
  const map = {
    running: { color: 'bg-green-500', text: '进行中', bg: 'bg-green-50 text-green-600' },
    paused: { color: 'bg-orange-500', text: '暂停', bg: 'bg-orange-50 text-orange-600' },
    finished: { color: 'bg-gray-400', text: '已结束', bg: 'bg-gray-100 text-gray-400' },
    waiting: { color: 'bg-blue-400', text: '待开局', bg: 'bg-blue-50 text-blue-500' },
    offline: { color: 'bg-red-400', text: '离线', bg: 'bg-red-50 text-red-500' },
  }
  return map[status] || map.offline
}
</script>

<template>
  <view class="min-h-screen bg-gray-100 pb-24 font-sans text-gray-800">
    <view class="pt-12 px-4 pb-2 flex justify-between items-center bg-white sticky top-0 z-50 shadow-sm">
      <view class="flex items-end gap-2">
        <text class="text-xl font-black text-gray-900 tracking-tight">
          Merchant OS
        </text>
        <view class="bg-indigo-100 text-indigo-600 text-xs px-1.5 py-0.5 rounded font-bold">
          v2.2
        </view>
      </view>

      <view class="flex bg-gray-100 p-1 rounded-full relative">
        <view
          class="px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 z-10"
          :class="currentView === 'dashboard' ? 'text-indigo-600' : 'text-gray-500'"
          @click="currentView = 'dashboard'"
        >
          📊 态势
        </view>
        <view
          class="px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 z-10"
          :class="currentView === 'teams' ? 'text-indigo-600' : 'text-gray-500'"
          @click="currentView = 'teams'"
        >
          👥 队伍
        </view>
        <view
          class="absolute top-1 bottom-1 w-[50%] bg-white rounded-full shadow-sm transition-all duration-300"
          :style="{ left: currentView === 'dashboard' ? '4px' : 'calc(50% - 4px)' }"
        ></view>
      </view>
    </view>

    <view class="p-4 space-y-4">
      <template v-if="currentView === 'dashboard'">
        <view class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 shadow-lg text-white relative overflow-hidden animate-fade-in">
          <view class="absolute -right-6 -top-6 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></view>
          <view class="relative z-10 flex justify-between items-start">
            <view>
              <view class="flex items-center gap-2 mb-1">
                <text class="text-lg">
                  📍
                </text>
                <text class="text-xl font-bold">
                  王记粮仓 (节点#042)
                </text>
              </view>
              <view class="flex items-center gap-1 opacity-90 text-sm">
                <view class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></view>
                <text>AI流量分发开启</text>
              </view>
            </view>
            <view class="bg-white/20 p-1 rounded-full w-12 h-7 flex items-center justify-end px-1">
              <view class="w-5 h-5 bg-white rounded-full shadow-sm"></view>
            </view>
          </view>
        </view>

        <view class="grid grid-cols-2 gap-3 animate-fade-in">
          <view class="bg-white rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <view class="flex items-center gap-1 text-gray-500 text-xs mb-2">
              <text>👥 当前排队/承载力</text>
            </view>
            <view class="flex items-baseline gap-1 mb-2">
              <text class="text-3xl font-black text-gray-900">
                5
              </text>
              <text class="text-gray-400 text-sm">
                / 20人
              </text>
            </view>
            <view class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <view class="bg-green-500 h-full rounded-full" style="width: 25%"></view>
            </view>
          </view>

          <view class="bg-white rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <view class="flex items-center gap-1 text-gray-500 text-xs mb-2">
              <text>🕒 预计15分钟客流</text>
            </view>
            <view class="flex items-baseline gap-1 mb-2">
              <text class="text-3xl font-black text-indigo-600">
                17
              </text>
              <text class="text-gray-400 text-sm">
                人
              </text>
            </view>
            <view class="bg-red-50 text-red-500 text-[10px] px-2 py-0.5 rounded flex items-center w-max">
              ⚠️ 含特殊需求
            </view>
          </view>
        </view>

        <view class="bg-white rounded-2xl p-4 shadow-sm min-h-[300px] animate-fade-in">
          <view class="flex justify-between items-center mb-4">
            <text class="font-bold text-gray-800 text-lg">
              流量预报
            </text>
            <view class="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">
              ● 实时更新
            </view>
          </view>
          <view class="space-y-4">
            <view v-for="item in flowList" :key="item.id" class="flex items-center gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
              <view class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm" :class="getTimeColor(item.arrivalTime)">
                {{ item.arrivalTime }}m
              </view>
              <view class="flex-1">
                <view class="flex items-baseline gap-2">
                  <text class="font-bold text-gray-900 text-base">
                    {{ item.teamName }}
                  </text>
                  <text class="text-gray-400 text-sm">
                    ({{ item.peopleCount }}人)
                  </text>
                </view>
                <view class="text-gray-500 text-xs mt-0.5">
                  任务: {{ item.taskName }}
                </view>
                <view v-if="item.tags" class="mt-1.5 flex gap-1">
                  <view v-for="(tag, tagIdx) in item.tags" :key="tagIdx" class="text-[10px] px-1.5 py-0.5 rounded border" :class="getTagColor(tag.type)">
                    {{ tag.label }}
                  </view>
                </view>
              </view>
              <view class="text-gray-300">
                ›
              </view>
            </view>
          </view>
        </view>
      </template>

      <template v-else>
        <view class="flex gap-2 animate-fade-in">
          <view class="flex-1 bg-white h-10 rounded-xl flex items-center px-3 shadow-sm text-gray-400 text-sm">
            🔍 搜索队伍...
          </view>
          <view class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-500">
            🌪️
          </view>
        </view>

        <view class="space-y-3 animate-slide-up">
          <view
            v-for="team in teamList"
            :key="team.id"
            class="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center active:bg-gray-50 transition-colors"
          >
            <view class="flex items-center gap-3">
              <view class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center font-bold text-lg">
                {{ team.name.charAt(0) }}
              </view>

              <view>
                <view class="flex items-center gap-2">
                  <text class="font-bold text-gray-800 text-base">
                    {{ team.name }}
                  </text>
                  <text class="text-gray-400 text-xs">
                    ({{ team.count }}人)
                  </text>
                </view>
                <view class="flex items-center gap-1.5 mt-1">
                  <view class="w-1.5 h-1.5 rounded-full" :class="getStatusConfig(team.status).color"></view>
                  <text class="text-xs text-gray-500">
                    {{ getStatusConfig(team.status).text }}
                  </text>
                </view>
              </view>
            </view>

            <view class="flex flex-col items-end gap-1">
              <view class="flex items-center gap-1">
                <text class="i-carbon-script text-gray-400 text-xs">
                  📜
                </text>
                <text class="text-sm font-medium text-gray-600 max-w-[120px] truncate text-right">
                  {{ team.script }}
                </text>
              </view>
              <text class="text-[10px] text-gray-300">
                ID: {{ team.id }}
              </text>
            </view>
          </view>
        </view>

        <view class="text-center py-8 text-gray-400 text-sm">
          - 暂无更多队伍 -
        </view>
      </template>
    </view>
    <CustomTabBar :current="0" />
  </view>
</template>

<style scoped>
/* 简单的进入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
.animate-slide-up {
  animation: slideUp 0.4s ease-out;
}
</style>
