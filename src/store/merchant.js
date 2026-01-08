import { defineStore } from 'pinia'
import { getAllGameScriptInfosAPI } from '@/api/merchant_game'

export const useMerchantStore = defineStore('merchant', () => {
  const gameScriptInfos = ref([])

  const getAllGameScriptInfos = async () => {
    const res = await getAllGameScriptInfosAPI()
    gameScriptInfos.value = res
  }

  return {
    gameScriptInfos,
    getAllGameScriptInfos,
  }
})
