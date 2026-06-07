# 篮球训练成长记录 — 项目记忆

> 最后更新：2026-06-07
> 构建状态：✅ GitHub Pages 已上线
> 在线地址：[jianingli328-arch.github.io/BasketballTrain](https://jianingli328-arch.github.io/BasketballTrain/)

---

## 项目简介

篮球训练记录 Web App，帮助球员记录每日训练动作、组数、次数/时长，跟踪训练进度。

支持四大训练分类：**原地运球**、**行进间组合**、**运球终结**、**投篮**。

---

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Vite 6 + React 19 |
| 路由 | react-router-dom v7 |
| 语言 | TypeScript ~5.7 |
| 存储 | localStorage (webStorage.ts 封装层) |
| 样式 | 纯 CSS 变量，橙色主题系 |
| 部署 | GitHub Pages (gh-pages 分支) |

> ⚠️ **项目演进说明**：本项目最初为 Expo/React Native App（含 EAS Build APK 构建），后迁移为纯 Web 版（Vite + React）。现在只有 Web 版在维护。

---

## 目录结构

```
BasketballTrain/
├── src/
│   ├── App.tsx                    # 根组件 + 路由 + 底部 Tab 导航
│   ├── main.tsx                   # ReactDOM 入口
│   ├── index.css                  # 全局样式 + CSS 变量
│   ├── components/
│   │   ├── ExerciseCard.tsx       # 动作卡片
│   │   ├── SetRecordEditor.tsx    # 组记录编辑器
│   │   ├── StatCard.tsx           # 统计数据卡片
│   │   ├── TrainingCalendar.tsx   # 训练日历组件
│   │   └── WorkoutTimer.tsx       # 训练计时器
│   ├── pages/
│   │   ├── HomePage.tsx           # 首页 - 训练概览 + 周进度
│   │   ├── ExercisesPage.tsx      # 动作库管理
│   │   ├── StatsPage.tsx          # 训练统计（总/周/月/年 + 投篮命中 + 分类）
│   │   ├── ProfilePage.tsx        # 我的（设置）
│   │   ├── NewSessionPage.tsx     # 新建训练（含计时器）
│   │   └── SessionDetailPage.tsx  # 训练详情与编辑
│   ├── storage/
│   │   ├── webStorage.ts          # localStorage CRUD 封装（Session/Item/Set/Exercise/Settings）
│   │   └── index.ts
│   ├── theme/
│   │   ├── colors.ts              # 主题色常量 #E65100
│   │   └── spacing.ts             # 间距/字号/圆角常量
│   ├── types/
│   │   ├── exercise.ts            # Exercise / ExerciseUnitType
│   │   ├── workout.ts             # WorkoutSession / WorkoutItem / SetRecord
│   │   ├── settings.ts            # Settings 类型
│   │   └── index.ts
│   └── utils/
│       ├── date.ts                # 日期格式化、周/月/年范围计算
│       ├── id.ts                  # ID 生成 (nanoid)
│       └── stats.ts               # 统计计算（周/月/年/分类/投篮）
│
├── index.html                     # Vite 入口 HTML
├── vite.config.ts                 # Vite 配置（base: /BasketballTrain/）
├── package.json                   # 依赖 + deploy 脚本
├── tsconfig.json
└── MEMORY.md                      # 本文件
```

---

## 核心数据类型

### Exercise（动作）
```typescript
type ExerciseUnitType = "reps" | "seconds" | "made_attempts" | "weight_reps"

type Exercise = {
  id: string; name: string; category: string;
  unitType: ExerciseUnitType;
  defaultSets: number; defaultTarget: number;
  note: string; archived: boolean;
  createdAt: number; updatedAt: number;
}
```

### WorkoutSession、WorkoutItem、SetRecord
```
Session 1:N WorkoutItem 1:N SetRecord
```
WorkoutSession 包含日期、开始/结束时间、时长、位置、训练重点、RPE、备注。
WorkoutItem 关联练习动作，SetRecord 存储每组的具体数据。

---

## 预设动作库（16个）

| 分类 | 动作 |
|---|---|
| **原地运球** | V字运球、变向运球、胯下运球、背后运球 |
| **行进间组合** | 变向胯下、胯下背后、变向胯下背后 |
| **运球终结** | 变向低手上篮、胯下低合球上篮、背后反篮、转身欧洲步上篮 |
| **投篮** | 中距离自投自捡、45°打板中距离、行进间抛投、三分球、急停跳投 |

---

## 功能清单

| 功能 | 状态 |
|------|------|
| 4 Tab 导航（训练/动作库/统计/我的） | ✅ |
| 新建训练会话（选动作 + 记组数 + 计时器） | ✅ |
| 训练日历（标记训练日 + 点击查看当天训练） | ✅ |
| 本周训练进度条（目标 vs 实际） | ✅ |
| 训练详情页（编辑/删除） | ✅ |
| 动作库管理（新增/归档） | ✅ |
| 统计页（总次数/总时长/周/月/年 + 投篮命中率 + 分类统计） | ✅ |
| 设置页（周目标/默认时长/训练目标） | ✅ |
| 数据持久化（localStorage） | ✅ |
| 移动端响应式 | ✅ |
| GitHub Pages 部署 | ✅ |

---

## 构建与部署

### 本地开发
```bash
npm install
npm run dev          # Vite dev server，默认 http://localhost:5173
```

### 生产构建
```bash
npm run build        # tsc -b && vite build → dist/
```

### 部署到 GitHub Pages
```bash
npm run deploy       # build + gh-pages -d dist → 推送到 gh-pages 分支
```

部署配置要点：
- `vite.config.ts` 中 `base: "/BasketballTrain/"`
- `package.json` 中 `homepage: "https://jianingli328-arch.github.io/BasketballTrain"`
- GitHub 仓库 Settings → Pages → Source: `gh-pages` 分支 `/ (root)`
- 仓库必须设为 Public（GitHub Pages 免费版不支持私有仓库）

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0.0 (RN) | 2026-06-04 | 初版：Expo/React Native，训练记录+动作库+统计+设置 |
| v1.1.0 (RN) | 2026-06-04 | 新增日历视图、训练计时器、详情页编辑（Expo 版） |
| v1.1.0 (Web) | 2026-06-07 | 迁移为纯 Web 版（Vite + React），功能对齐 RN 版 |
| v1.1.0-deploy | 2026-06-07 | GitHub Pages 上线，修复 base path + homepage URL |

---

## 小技巧

- 数据存储在浏览器 localStorage 中，清除浏览器数据会丢失记录
- 不同设备/浏览器之间数据不互通（纯前端方案）
- 主题色：橙色 `#E65100`
- 单元类型决定了 SetRecord 中记录的字段：`reps`→actual, `seconds`→seconds, `made_attempts`→made/attempts
