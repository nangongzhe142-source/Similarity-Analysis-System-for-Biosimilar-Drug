# BioCompare 两层折叠交互改造交付说明

## 改造结果

总项目页面已改为两层结构：

1. 第一层为全部专项的总览列表，展示项目编号、名称、说明、专业引擎、方法、任务状态、进度和运行消息。
2. 第二层为原专项工作区，默认不渲染；点击对应总览条目的“查看具体项目对比”后，在该条目下方展开。
3. 再次点击同一按钮或明细区“收起明细”按钮即可折叠。
4. 多个专项可同时展开，便于并排滚动审阅；独立专项路由继续保留。

## 状态管理

使用 `Set<string>` 保存已展开的模块 ID。每次切换均创建新的 Set，符合 React 不可变状态更新要求：

```tsx
const [expandedModules, setExpandedModules] = useState<Set<string>>(() => new Set());

function toggleModule(moduleId: string) {
  setExpandedModules((current) => {
    const next = new Set(current);
    if (next.has(moduleId)) next.delete(moduleId);
    else next.add(moduleId);
    return next;
  });
}
```

按钮使用 `aria-expanded` 和 `aria-controls` 描述展开关系；初始 Set 为空，因此服务端和首次页面渲染都不会输出第二层内容。

## 复用方式

原有 `ModuleWorkspace` 只增加可选的 `embedded` 展示参数：

```tsx
export function ModuleWorkspace({ module, embedded = false }) {
  return <section className={embedded ? "embedded-workspace" : "section-stack"}>
    {!embedded && <IndependentPageBanner />}
    {/* 原输入、运行、状态、结果入口保持原样 */}
  </section>;
}
```

总项目展开后直接复用：

```tsx
{expanded && <div id={detailId} className="module-inline-detail">
  <ModuleWorkspace module={module} embedded />
</div>}
```

## 修改文件

- `app/project/module-accordion.tsx`：新增一级总览和展开状态管理。
- `app/project/page.tsx`：用折叠列表替换原专项卡片网格。
- `app/modules/[moduleId]/module-workspace.tsx`：增加内嵌展示模式；业务逻辑保持原样。
- `app/globals.css`：新增总览行、展开明细、按钮和响应式样式。

## 未修改范围

- 未修改 `backend/` 下任何文件。
- 未修改 OpenMS、Sage、UniDec 或 FLASHDeconv 调用。
- 未修改 `project-provider.tsx` 中的上传、参数组装、轮询和任务运行逻辑。
- 未修改 API 路径、请求参数、返回结构和报告逻辑。

## 验证

- TypeScript `tsc --noEmit`：通过。
- Next.js 16.3.0 生产构建：通过。
- 在线 `/project`：HTTP 200。
- 在线首屏包含“查看具体项目对比”和“全部比对项目总览”。
- 在线首屏不包含“第二层明细”，确认默认折叠。
- 独立专项与结果路由继续参与生产构建。
