# 求职无忧 🎯

面向大学生的求职全流程工具（移动端 H5，微信内可打开）：看机会 → 改简历 → 记录投递 → 刷面经。

纯前端 MVP，**无后端、无登录**：数据存 localStorage，AI 诊断用前端规则模拟（已预留真实 API 接口）。

## 功能

| Tab | 功能 |
| --- | --- |
| 🎯 机会 | 未来 3 个月求职时间线（红=7天内截止/蓝=进行中/灰=已过）；岗位卡片流（职位ID、公司、岗位、赛道、地点、薪资、发布/截止日期、平台、岗位要求、应聘流程、内推码）；行业多选+城市/类型筛选；收藏、加入日历、标记已投、隐藏；今日提醒 |
| 📄 简历 | 上传（.txt/.md/.html，支持点击+拖拽）或粘贴简历；目标 JD 一键带入；AI 诊断：匹配分、关键词缺失、STAR 改写建议、风险提示；一键生成优化简历 .doc 下载；免费 1 次/天 + 付费 UI 占位 |
| 📋 投递 | 列表/看板双视图；十态流程（待投递→已投递→待测评→已测评→待AI面→待面试→待Offer→已Offer→已拒→流程结束）；下一步日期、复盘、备注、简历版本；面试前/测评当天/7天无反馈提醒 |
| 💬 面经 | 预置面经流，搜索+公司/类型筛选，「全网搜索」为预留 API 占位 |

## 技术栈

Vite 5 · React 18 · TypeScript · Tailwind CSS 3

## 本地开发

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 产物输出到 dist/
```

要求 Node.js ≥ 18。

## 部署到 Vercel

方式一（推荐）：推送到 GitHub 后，在 [vercel.com](https://vercel.com) → Add New Project → 导入仓库，框架预设会自动识别为 Vite，直接点 Deploy 即可。

方式二（CLI）：

```bash
npm i -g vercel
vercel          # 预览
vercel --prod   # 生产
```

无需任何额外配置：纯静态站点，Vercel 自动执行 `npm run build` 并托管 `dist/`。

## 推送到 GitHub

```bash
cd qiuzhi-wuyou
git init
git add .
git commit -m "feat: 求职无忧 MVP"
git branch -M main
git remote add origin https://github.com/<你的用户名>/qiuzhi-wuyou.git
git push -u origin main
```

## 目录结构

```
src/
├── data/
│   ├── jobs.ts          # 预置 15 个岗位（截止日期按当前日期动态生成）
│   ├── interviews.ts    # 预置面经
│   ├── sampleResume.ts  # 示例简历
│   ├── sampleJD.ts      # 示例 JD ×3
│   └── options.ts       # 行业/岗位选项（画像页与机会页共用）
├── pages/               # JobsPage / ResumePage / BoardPage / InterviewPage
├── components/          # Onboarding / TabBar / ReminderBar
├── utils/
│   ├── diagnose.ts      # 规则诊断引擎，apiDiagnose() 为真实 API 占位
│   └── timeline.ts      # 求职时间线生成
├── store.ts             # localStorage 状态管理（useSyncExternalStore）
└── types.ts             # 类型定义 + 旧数据迁移
```

## 接入真实后端

三个预留点，替换为 fetch 即可：

- `src/utils/diagnose.ts` → `apiDiagnose()`：真实 AI 简历诊断
- `src/pages/InterviewPage.tsx` → `apiSearchInterviews()`：全网面经搜索
- `src/data/jobs.ts` → `JOBS`：岗位列表接口化（含每日更新）

## 说明

- 用户数据（画像、收藏、简历文本、投递记录）仅存于浏览器 localStorage，清缓存即丢失
- 岗位/面经为演示数据，非真实在招信息
