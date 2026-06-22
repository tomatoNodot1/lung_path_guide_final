## 目标

重构 `src/components/AllCompletedPage.tsx` 的 UI 层级，让「太原市免费早癌筛查」卡片在首屏直接曝光，提升转化率。

## 修改内容（仅影响 JSX 结构与文案，所有交互与埋点逻辑绝对不变）

1. **精简护士气泡文案**
  - 将第 99–101 行气泡内容从 3 句缩减为仅保留首句：
  - 保留原有的 `<Highlight>` 包裹，。
2. **彻底移除勋章墙**
  - 删除第 105–115 行的整个 `<section>`（包含 3 个 `<Medal>` 组件）。
  - 同步删除第 7 行的 `import { Medal }`。
3. **上移筛查引导卡片**
  - 将现有的浅绿色卡片（第 117–147 行）整块上移，紧接在护士对话气泡 `</section>` 之后。
  - 卡片内部文案、兜底文案（"不在年龄范围内？也没关系..."）、复制按钮样式、`navigator.clipboard` 逻辑、`logAction("m3_copy_taiyuan_program")` 埋点、`copyHint` 状态提示，全部原封不动。
4. **底部操作区保持原样**
  - 「回顾我的旅程」与「返回登入页」按钮及其 `onClick` 逻辑、`reviewing` 状态、`logAction` 埋点调用，位置紧跟在绿色筛查卡片之后，保持不变。

## 变更范围

仅修改 `src/components/AllCompletedPage.tsx` 单文件，不触碰 `game-state.tsx` 或其他任何组件。