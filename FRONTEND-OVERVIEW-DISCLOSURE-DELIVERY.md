# BioCompare 全部项目总览整体折叠交付

## 实现结果

- 页面保留“比对项目一级概览”父容器，展示专项总数、已有结果和需关注数量。
- “全部比对项目总览”标题、六个专项列表以及所有内部按钮默认不渲染。
- 点击“查看全部比对项目总览”后，整体挂载原有 `ModuleAccordion`。
- 展开后按钮变为“收起全部比对项目总览”，再次点击卸载总览内容。
- 每个项目内部原有“查看具体项目对比”折叠、进度条、状态、专业引擎说明及专项运行入口全部保留。

## 状态逻辑

```tsx
const [overviewExpanded, setOverviewExpanded] = useState(false);

<button
  aria-expanded={overviewExpanded}
  aria-controls="all-comparison-projects-overview"
  onClick={() => setOverviewExpanded((current) => !current)}
>
  {overviewExpanded ? "收起全部比对项目总览" : "查看全部比对项目总览"}
</button>

{overviewExpanded && <ModuleAccordion />}
```

采用条件渲染而非 `display:none`，保证初始页面 DOM 不包含完整项目总览，也不会提前渲染第二层专项工作区。

## 修改范围

- 新增 `app/project/project-overview-disclosure.tsx`
- 修改 `app/project/page.tsx`
- 修改 `app/globals.css`

未修改 `backend/`、`app/project-provider.tsx`、OpenMS/Sage、API、计算逻辑或返回结构。

## 验证

- TypeScript 检查通过。
- Next.js 16.3.0 生产构建通过。
- `http://localhost:3000/project` 返回 HTTP 200。
- 初始页面包含一级父容器和整体展开按钮。
- 初始页面不包含“全部比对项目总览”标题及“查看具体项目对比”子项按钮。
