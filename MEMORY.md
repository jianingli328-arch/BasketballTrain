# 篮球训练成长记录 — 项目记忆

> 最后更新：2026-06-04
> 构建状态：? EAS APK 构建成功

---

## 项目简介

篮球运球训练记录 App，帮助球员记录每日训练动作、组数、次数/时长，跟踪训练进度。

支持四大训练分类：**原地运球**、**行进间组合**、**运球终结**、**投篮**。

---

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Expo SDK 56 |
| 路由 | expo-router (文件路由) |
| UI | React Native (0.85.3) |
| 语言 | TypeScript (5.9.3) |
| 存储 | @react-native-async-storage/async-storage (本地 JSON) |
| 导航 | @react-navigation/bottom-tabs |
| 构建 | EAS Build (云端 APK/AAB) |

---

## 目录结构

```
BasketballTrain/
├── app/                    # 页面路由 (expo-router 文件路由)
│   ├── (tabs)/             # 底部 Tab 页面
│   │   ├── _layout.tsx     # Tab 布局 (4个 tab)
│   │   ├── index.tsx       # ?? 首页 - 训练概览
│   │   ├── exercises.tsx   # ?? 动作库
│   │   ├── stats.tsx       # ?? 统计
│   │   └── profile.tsx     # ?? 我的(设置)
│   ├── session/
│   │   ├── new.tsx         # 新建训练 (modal)
│   │   └── [id].tsx        # 训练详情
│   └── _layout.tsx         # 根布局 (Stack)
│
├── src/
│   ├── components/         # 可复用 UI 组件
│   │   ├── ExerciseCard.tsx
│   │   ├── SetRecordEditor.tsx
│   │   └── StatCard.tsx
│   ├── data/
│   │   └── seedExercises.ts    # 默认动作种子数据 (17个动作)
│   ├── storage/                # AsyncStorage 数据层
│   │   ├── exerciseStorage.ts  # 动作 CRUD
│   │   ├── workoutStorage.ts   # 训练/组记录 CRUD
│   │   ├── settingsStorage.ts  # 设置持久化
│   │   ├── storageKeys.ts      # Storage key 常量
│   │   └── index.ts
│   ├── theme/
│   │   ├── colors.ts           # 主题色 (橙色系 #E65100)
│   │   └── spacing.ts          # 间距/字号/圆角常量
│   ├── types/
│   │   ├── exercise.ts         # Exercise / ExerciseUnitType
│   │   ├── workout.ts          # WorkoutSession / WorkoutItem / SetRecord
│   │   ├── settings.ts         # Settings 类型
│   │   └── index.ts
│   └── utils/
│       ├── date.ts             # 日期格式化、周/月范围计算
│       ├── id.ts               # ID 生成
│       └── stats.ts            # 统计计算 (周/月/年)
│
├── plugins/                # (已废弃) 自定义 Expo 插件
│   ├── withKotlinVersion.js
│   └── withGradleVersion.js
│
├── scripts/
│   └── prebuild.js         # (已废弃) 自定义 prebuild 脚本
│
├── app.json                # Expo 主配置
├── eas.json                # EAS Build 配置
├── package.json
└── tsconfig.json
```

---

## 核心数据类型

### Exercise（动作）
```typescript
type ExerciseUnitType = "reps" | "seconds" | "made_attempts" | "weight_reps"

type Exercise = {
  id: string
  name: string
  category: string        // 四个分类之一
  unitType: ExerciseUnitType  // 计量单位类型
  defaultSets: number     // 默认组数
  defaultTarget: number   // 默认每组目标
  note: string
  archived: boolean
  createdAt: number
  updatedAt: number
}
```

### WorkoutSession（训练会话）
```typescript
type WorkoutSession = {
  id: string
  date: string            // "YYYY-MM-DD"
  startTime: number
  endTime: number | null
  durationMinutes: number
  location: string
  focus: string[]
  overallRpe: number | null
  note: string
}
```

### WorkoutItem（训练项）& SetRecord（组记录）
```
Session 1:N WorkoutItem 1:N SetRecord
```

---

## 预设动作库（17个）

| 分类 | 动作 |
|---|---|
| **原地运球** | V字运球、变向运球、胯下运球、背后运球 |
| **行进间组合** | 变向胯下、胯下背后、变向胯下背后 |
| **运球终结** | 变向低手上篮、胯下低合球上篮、背后反篮、转身欧洲步上篮 |
| **投篮** | 中距离自投自捡、45°打板中距离、行进间抛投、三分球、急停跳投 |

---

## 构建与部署

### 本地开发
```bash
npm start              # Expo dev server
npm run web            # Expo Web (浏览器预览)
npm run android        # 需要本地 Android SDK
```

### EAS 云构建 (APK)
```bash
npx eas-cli build --platform android --profile preview
```

### EAS 云构建 (AAB - Play Store)
```bash
npx eas-cli build --platform android --profile production
```

当前预览配置在 `eas.json` 的 `preview` profile 中。

---

## 构建历史 & 踩坑记录

### 2026-06-04 (第二次): 真正修复闪退 — Expo SDK 56 需要 React 19

**根因分析：**
之前的"修复"文档说降级 React 18 和 TypeScript 5，但这是**错误的**。


px expo install --fix 揭示 Expo SDK 56 实际需要的版本：

| 包 | 之前安装的版本 | Expo SDK 56 期望版本 | 修复后版本 |
|---|---|---|---|
| react | 18.3.1 ? | 19.2.3 | 19.2.3 ? |
| react-dom | 18.3.1 ? | 19.2.3 | 19.2.3 ? |
| react-native-gesture-handler | 3.0.0 ? | ~2.31.1 | 2.31.2 ? |
| react-native-safe-area-context | 5.8.0 ? | ~5.7.0 | 5.7.0 ? |
| @react-native-async-storage/async-storage | 3.1.1 ? | 2.2.0 | 2.2.0 ? |
| typescript | 5.8.0 ? | ~6.0.3 | 6.0.3 ? |
| @types/react | 18.3.0 ? | ~19.2.14 | 19.2.16 ? |

**关键教训：** 永远不要手动降级 React 版本 — 用 
px expo install --fix 让 Expo 自动解析兼容版本。

**闪退机制：** TypeError: Cannot read property 'S' of undefined
- React 18 的 Fiber reconciler API 与 React 19 的 react-native-renderer 不兼容
- renderApplication 调用 renderElement 时，Fiber 节点缺少 S 属性（React 19 的新内部属性）
- 导致 require() 链路上 undefined.S 访问异常

**修复命令：**
`ash
npx expo install --fix
`
自动升级/降级所有包到 SDK 56 兼容版本。
---

## PATH 环境变量（Windows 注意）

由于 Codex 自带的 Node.js 在 WindowsApps 目录，执行 npm/npx 时需要用以下方式设置 PATH：

```powershell
$env:Path = "C:\Program Files\nodejs;" + ($env:Path -replace 'C:\\Program Files\\WindowsApps[^;]*;?','')
```

或者安装 Git 后可以用 VCS 模式运行 EAS。

---

## 小技巧

- 所有数据存储在 AsyncStorage 中，清除 App 数据或卸载重装会丢失记录
- 主题色：橙色 `#E65100`，参考了篮球的配色
- 单元类型（unitType）决定了 SetRecord 中记录的字段：`reps`→actual, `seconds`→seconds, `made_attempts`→made/attempts


---

## 更新 App 版本（迭代后重新安装）

### 方法一：本地构建 APK（推荐）

`ash
# 1. 确保依赖安装完整
npm install

# 2. 本地构建 APK（需要 Android SDK）
npx expo run:android

# 构建完成后 APK 位置：
# android/app/build/outputs/apk/release/app-release.apk
`

### 方法二：EAS 云构建（无需本地 SDK）

`ash
# 预览版 APK（直接安装到手机）
npx eas-cli build --platform android --profile preview

# 构建完成后 EAS 会返回下载链接
# 在浏览器打开链接下载 .apk 文件
`

### 方法三：开发预览（不构建，直接运行）

`ash
# 1. 启动开发服务器
npm start

# 2. 手机安装 Expo Go App（来自应用商店）
# 3. 用 Expo Go 扫描终端显示的二维码
# 4. 代码修改会热更新，无需重新安装

# 注意：Expo Go 方式数据存于手机本地，
# 正式 APK 安装后原有数据不共享
`

### 升级流程（从旧版 APK 升级）

1. 用方法一或方法二生成新的 APK
2. 将 APK 传到手机（微信/QQ/网盘/数据线等方式）
3. 在手机上点击 APK 文件安装
4. 安装时会提示"更新"，确认后覆盖安装
5. 原有训练数据保存在 AsyncStorage 中，**不会丢失**

> ?? 注意：如果改了 Android 包名（pp.json 中的 ndroid.package），系统会认为这是两个不同的 App，数据也无法共享。目前包名是 com.basketballtrain.app，保持不动即可。

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0.0 | 2026-06-04 | 初版：训练记录、动作库、统计、设置 |
| v1.1.0 | 2026-06-04 | 新增日历视图、训练计时器、详情页编辑功能 |

---

## 最新 APK 下载

| 版本 | 构建ID | 下载链接 | 完成时间 |
|------|--------|---------|---------|
| v1.1.0 (日历+计时器+编辑) | 0fef1b4c | [下载 APK](https://expo.dev/artifacts/eas/2Y81h7w3EykQATfYFxoHuj.apk) | 2026-06-04 22:19 |

### 安装方式
1. 在手机浏览器打开上面的下载链接
2. 下载 .apk 文件
3. 点击安装（如果提示"未知来源"，在设置中允许）
4. 覆盖安装不会丢失原有训练数据
