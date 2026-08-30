# BioCompare UI / 信息架构升级交付

日期：2026-08-25

## 技术栈

- Next.js 16.3 App Router
- React 19.2
- TypeScript 5.9
- 原生 CSS；未引入新 UI 框架
- 新增交互状态全部保存在浏览器 localStorage

## 九项验收

1. ✅ 全局名称改为“生物类似药多维药学项目比对工作台”；浏览器标题、首页、品牌辅助文字和页脚已更新。旧名称搜索结果 0。
2. ✅ 左侧导航改为模块分组两级折叠；包含已接入与待接入项目、状态圆点、计数徽章、当前项高亮；侧栏及分组状态刷新保持。
3. ✅ 专业引擎任务历史默认收起，显示最近任务摘要；展开显示最近 10 条、引擎、状态、耗时及查看全部入口。
4. ✅ 侧栏卡片化、统一线性图标、字体层级、悬停/选中和细滚动条完成。
5. ✅ 汇总报告具备五项 KPI、模块手风琴、总体结论边界、风险区和可折叠分页明细表。
6. ✅ 统一输入页“专项输入分配”默认收起，显示已分配专项及文件数摘要；展开保留完整上传能力，并分页展示。
7. ✅ 项目目录按分类手风琴展示，提供展开全部/收起全部；长表格固定表头或分页；所有现有页面保留统一页头与操作区。
8. ✅ 首页四项统计移至页面底部“汇总统计区”，顶部仅保留核心上传、调度与项目入口。
9. ✅ 完成科研蓝青色体系、统一状态色、说明抽屉、全局搜索占位、浅深主题、空状态、卡片浮起、按钮反馈、数字入场动画和响应式布局。

## 回归验证

- Next.js 生产构建通过，原有 7 个路由类型全部保留。
- 浏览器控制台错误：0。
- localStorage 刷新保持：侧栏宽度、侧栏模块、任务历史、输入分配、报告模块、目录分类。
- 统一上传入口可见并保留原事件处理。
- 专项结果“穿透”链接仍指向 `/modules/[moduleId]/results`。
- 未修改后端接口、API 路径、数据库或计算业务流程。

## 截图

| 页面 | 改造前 | 改造后 |
|---|---|---|
| 总项目 | `validation/ui-upgrade/before-project.png` | `validation/ui-upgrade/after-project.png` |
| 汇总报告 | `validation/ui-upgrade/before-report.png` | `validation/ui-upgrade/after-report.png` |
| 统一输入 | `validation/ui-upgrade/before-data.png` | `validation/ui-upgrade/after-data.png` |

## 主要变更文件

- `app/workspace-shell.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `app/project/page.tsx`
- `app/project/data/page.tsx`
- `app/project/report/page.tsx`
- `app/project/characterization-catalog.tsx`
- `app/project/project-overview-disclosure.tsx`
- `app/project/module-accordion.tsx`
- `scripts/capture_ui_upgrade.cjs`
- `scripts/validate_ui_upgrade.cjs`

