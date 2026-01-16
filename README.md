---

# 📜 Merchant OS (Guide Side) 开发文档

**版本**: 2.0 (Precision Logic Update)
**更新日期**: 2026-01-15
**技术栈**: UniApp + Vue 3 (Script Setup) + Pinia + Socket.IO

---

## 1. 项目概述

本项目是“Merchant OS”剧本杀系统的**导游端（Guide Admin）**。主要功能是让导游实时监控各个玩家队伍的状态，处理任务提交请求（人工确认/强制跳过），并查看队伍成员详情。

---

## 2. 核心状态管理 (Pinia)

### 2.1 Game Store (`store/game.js`)

负责存储当前选中的队伍、游戏 ID 以及当前任务详情。

- **`gameId`**: 当前游戏的唯一标识（UUID）。
- _注意_：这是最容易丢失的数据。项目采用了“ID 吸尘器”策略，在任何 Socket 消息中捕捉此字段。

* **`currentTask`**: 当前正在进行的任务对象（包含 `sub_tasks`）。

- **`selectedSubTaskId`**: **(已弃用/仅做兼容)** 在新版精确提交逻辑中，我们直接传递对象，不再依赖 Store 里的这个指针，防止脏数据穿越。

### 2.2 Socket Store (`store/socket.js`)

负责与后端的实时长连接。

- **`submitTask(data, mechanismType)`**: 通用的提交入口。
- **校验机制**：发送前强制检查 `gameId`，如果缺失直接拦截并报错。
- **参数优先级**：`data.sub_task_id` (参数传入) > `store.selectedSubTaskId` (缓存)。**永远优先使用参数传入的 ID。**

---

## 3. 核心业务逻辑

### 3.1 GameID 自动捕获 ("ID 吸尘器"模式)

由于后端某些接口（如列表、部分 Task 包）可能缺失 `game_id`，前端采取**“宁滥勿缺”**的策略：

在 `pages/index/index.vue` 的 `attachPageListeners` 中，监听所有关键 Socket 事件：

- `game:game_created`
- `game_started`
- `game:cur_task`
- `game:new_task`

**逻辑**：一旦在数据包的任何层级（根目录、`player_state`、`task`）发现 `game_id`，立即写入 Store。

### 3.2 任务提交逻辑 (Precision Submit)

为了解决子任务 ID 错乱（如 T03 的子任务 ID 污染了 T07）的问题，我们废弃了全局推测，改为**对象直传**。

**函数**: `performSpecificSubmit(targetObj, isSubTask)`

1. **ID 终极修复**：

- 如果 Store 缺 `gameId`，先从 `targetObj.game_id` 找。
- 再从 `teamList` 当前队伍找。
- 如果都找不到，弹窗阻断，提示刷新。

2. **机制判断**：

- 读取 `task_complete_mechanisms`。
- **STAFF_CONFIRM**：发送确认包。
- **其他 (如 GPS)**：如果导游点击跳过，前端伪造数据（如 `[0,0]` 坐标）发送 `GPS_CHECK` 包。

### 3.3 任务 UI 渲染策略

- **状态 0/1 (准备中)**：显示“分配剧本”、“同步”、“开始游戏”按钮。
- **状态 2 (进行中)**：采用 **分层渲染**。
- **顶部**：主任务 (Main Stage) 面板，含“强制结算本幕”按钮。
- **列表**：子任务 (Sub Tasks) 列表，每个子任务后跟独立的“确认/跳过”按钮。

* **状态 3 (已结束)**：按钮置灰。

---

## 4. 通信协议 (Socket & API)

### 4.1 关键 Socket 事件 (监听)

| 事件名          | 触发时机   | 前端处理逻辑                                           |
| --------------- | ---------- | ------------------------------------------------------ |
| `game_started`  | 游戏开始   | 切换队伍状态至 2，更新 `cur_task_id`，捕获 `game_id`。 |
| `game:new_task` | 收到新任务 | 刷新列表显示，弹窗提示，**清空旧的子任务选中状态**。   |
| `task_finished` | 任务完成   | **若是子任务**：本地打勾 (UI变灰)。<br>                |

<br>**若是主任务**：按钮变灰，等待下一关。 |
| `game:cur_task` | 进度恢复/同步 | 用于重连或手动点击“同步”按钮时，强制对齐后端状态。 |

### 4.2 关键 Socket 事件 (发送)

- **提交任务 (`game:task-submit`)**

```json
{
  "game_id": "uuid...", // 必传
  "task_id": "T02...", // 必传
  "sub_task_id": "T02_S1", // 可选，仅提交子任务时传
  "submission_data": {
    "mechanism_type": "STAFF_CONFIRM",
    "staff_id": "GUIDE_ADMIN"
  }
}
```

### 4.3 REST API 接口

- **获取队伍列表**: `GET /api/v1/guide/teams`
- **获取成员列表**: `GET /api/v1/guide/teams/{team_id}/members`
- _注意_：必须包含 `/api/v1` 前缀，否则报 404。

---

## 5. 常见问题排查 (Troubleshooting)

### Q1: 点击提交无反应，控制台报 "Store中缺失 gameId"

- **原因**：后端列表接口未返回 `game_id`，且未触发过 `game_started` 事件。
- **解法**：

1. 点击右上角“刷新”，触发 `handleManualRefresh` 尝试找回 ID。
2. 确保 `performSpecificSubmit` 中的“终极救命补丁”代码生效。

### Q2: 报错 "子任务不存在: T03_S1"

- **原因**：前端缓存了上一关的子任务 ID，导致发包时 ID 不匹配。
- **解法**：已修复。现在的 `submitTask` 优先使用参数传递的 ID，忽略 Store 缓存。同时 `new_task` 事件会强制清空缓存。

### Q3: 成员列表弹窗报错 "currentMemberList is not defined"

- **原因**：`<script setup>` 中忘记 `const currentMemberList = ref([])`。
- **解法**：检查变量定义区域。

---

## 6. 目录结构说明

```text
src/
├── api/
│   └── team.js          // 队伍相关 API (列表、成员)
├── pages/
│   └── index/
│       └── index.vue    // 核心业务页 (Socket监听、UI逻辑全在这里)
├── store/
│   ├── game.js          // 游戏状态 (GameID, Task 对象)
│   └── socket.js        // Socket 连接与发包 (submitTask)
└── utils/
    └── request.js       // Axios 封装 (注意响应拦截器逻辑)

```
