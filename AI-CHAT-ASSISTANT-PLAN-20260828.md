# BioCompare 内置 AI 对话助手 · 实施计划（20260828）

> 本文档是给实施 AI 的完整执行说明书。请**严格按照本文档执行**，不要自行扩大改动范围。
> 目标：在 `/project` 等所有页面右下角嵌入一个可对话的浮动 AI 助手，回答流式输出，复用项目已有的 AI 配置。

---

## 1. 现状关键事实（已核实，实施前不要重复探索）

| 项 | 事实 |
| --- | --- |
| 前端 | Next.js 16.3（App Router）+ React 19 + pnpm，dev 运行于 `127.0.0.1:3000`，样式为 `app/globals.css` 中的自定义 CSS（无 Tailwind），CSS 变量：`--ink --muted --line --paper --white --teal --teal2 --orange --violet --nav` |
| 后端 | FastAPI（`backend/service.py`），运行于 `127.0.0.1:8000`，已开 CORS，由 `scripts/start-local.ps1` 启动 |
| 前后端通信 | 前端直连后端：`app/project-provider.tsx:47` 处 `const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";` |
| 已有 AI 通道 | `backend/ai_gateway.py` 的 `call_openai_compatible()` 已用 urllib 调 OpenAI 兼容接口，环境变量 `AI_BASE_URL` / `AI_API_KEY` / `AI_MODEL`（`.env.local` 已配置，`start-local.ps1` 会把它注入进程环境） |
| 布局挂载点 | `app/layout.tsx`：`ProjectProvider > WorkspaceShell > children`。`app/workspace-shell.tsx` 渲染侧栏 + `<main>`，浮动组件应挂在 `WorkspaceShell` 返回树的最外层 |
| 主题切换 | `WorkspaceShell` 会设置 `document.documentElement.dataset.theme`（light/dark），深色主题通过覆盖 CSS 变量实现。**新组件必须只用 CSS 变量，不得写死颜色** |

## 2. 方案总览

```
浏览器（浮动聊天组件，SSE 流式渲染）
   │  POST /api/chat  { messages: [...] }
   ▼
FastAPI backend/service.py  ──新增路由──▶  backend/chat_gateway.py（新增）
   │                                          │  OpenAI 兼容 /chat/completions，stream=true
   │                                          │  读取 AI_BASE_URL / AI_API_KEY / AI_MODEL
   ▼                                          ▼
SSE：data:{"delta":"…"} … data:[DONE]      外部模型服务（复用现有配置）
```

设计要点：
1. **不加任何新依赖**（前端零新包；后端只用标准库 urllib + 已有 FastAPI）。
2. **密钥只在 Python 服务端**，浏览器永远拿不到 `AI_API_KEY`。
3. 后端统一做消息裁剪（最多 30 条、单条 2000 字符）与系统提示词，前端只管展示。
4. 未配置 AI 时返回明确错误信息，前端友好展示，不影响页面其他功能。

## 3. 改动清单（共 5 处）

| # | 文件 | 操作 |
| --- | --- | --- |
| 1 | `backend/chat_gateway.py` | **新建**：流式对话网关 |
| 2 | `backend/service.py` | **修改**：导入 + 新增 `POST /api/chat` 路由 |
| 3 | `app/ai-chat-widget.tsx` | **新建**：浮动聊天组件（"use client"） |
| 4 | `app/workspace-shell.tsx` | **修改**：导入并在返回树最外层挂载 `<AiChatWidget />` |
| 5 | `app/globals.css` | **修改**：文件末尾追加组件样式 |

除以上 5 处外**不得改动任何其他文件**，不得改动现有接口与页面行为。

---

## 4. 代码

### 4.1 新建 `backend/chat_gateway.py`（完整文件）

```python
"""Streaming chat gateway for the workspace AI assistant."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any, Iterator

SYSTEM_PROMPT = (
    "你是 BioCompare 生物类似药药学比对工作台内置的 AI 助手，面向 CMC 审评与研发场景。"
    "请用中文回答，保持专业、简洁、结构清晰。"
    "你不掌握当前页面的实时数据：涉及具体数据结论时，提醒用户以页面内各专项引擎的计算结果为准；"
    "不替代监管审评结论，不编造实验数据、法规条款或文献。"
)

MAX_MESSAGES = 30
MAX_MESSAGE_CHARS = 2000
REQUEST_TIMEOUT_SECONDS = 120


class ChatGatewayError(RuntimeError):
    """Raised with a user-presentable message."""


def ensure_configured() -> None:
    api_key = os.getenv("AI_API_KEY", "").strip()
    model = os.getenv("AI_MODEL", "").strip()
    if not api_key or not model:
        raise ChatGatewayError("AI 助手未配置：请在 .env.local 中设置 AI_API_KEY 与 AI_MODEL，然后重启后端。")


def normalize_messages(raw_messages: list[dict[str, Any]]) -> list[dict[str, str]]:
    if not isinstance(raw_messages, list) or not raw_messages:
        raise ChatGatewayError("消息列表不能为空。")
    trimmed = raw_messages[-MAX_MESSAGES:]
    messages: list[dict[str, str]] = [{"role": "system", "content": SYSTEM_PROMPT}]
    for item in trimmed:
        role = str(item.get("role", ""))
        content = str(item.get("content", "")).strip()
        if role not in {"user", "assistant"} or not content:
            continue
        messages.append({"role": role, "content": content[:MAX_MESSAGE_CHARS]})
    if len(messages) <= 1 or messages[-1]["role"] != "user":
        raise ChatGatewayError("最后一条有效消息必须是用户消息。")
    return messages


def stream_chat_reply(messages: list[dict[str, str]]) -> Iterator[str]:
    api_key = os.getenv("AI_API_KEY", "").strip()
    model = os.getenv("AI_MODEL", "").strip()
    if not api_key or not model:
        raise ChatGatewayError("AI 助手未配置：请在 .env.local 中设置 AI_API_KEY 与 AI_MODEL，然后重启后端。")
    base_url = os.getenv("AI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    body = json.dumps({
        "model": model,
        "temperature": 0.3,
        "stream": True,
        "messages": messages,
    }).encode("utf-8")
    request = urllib.request.Request(
        f"{base_url}/chat/completions",
        data=body,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        response = urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT_SECONDS)
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")[:300]
        raise ChatGatewayError(f"模型接口返回 HTTP {error.code}: {detail}") from error
    except urllib.error.URLError as error:
        raise ChatGatewayError(f"无法连接模型服务: {error.reason}") from error

    with response:
        for raw_line in response:
            line = raw_line.decode("utf-8", errors="replace").strip()
            if not line.startswith("data:"):
                continue
            payload = line[5:].strip()
            if payload == "[DONE]":
                break
            try:
                delta = json.loads(payload)["choices"][0]["delta"].get("content")
            except (KeyError, IndexError, AttributeError, json.JSONDecodeError):
                continue
            if delta:
                yield delta
```

### 4.2 修改 `backend/service.py`

**(a) 导入区改动**（现有导入见文件第 3–25 行附近）：

- 第 19 行 `from typing import Any` 改为 `from typing import Any, Iterator`
- 第 23 行 `from fastapi.responses import FileResponse, PlainTextResponse` 改为 `from fastapi.responses import FileResponse, PlainTextResponse, StreamingResponse`
- 在 `from backend.ai_gateway import generate_report` 之后新增一行：`from backend.chat_gateway import ChatGatewayError, ensure_configured, normalize_messages, stream_chat_reply`
- 若文件中尚无 pydantic 导入，新增：`from pydantic import BaseModel`

**(b) 新增路由**（放在 `def health()` 附近、与其他路由并列即可）：

```python
class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


@app.post("/api/chat")
def api_chat(payload: ChatRequest) -> StreamingResponse:
    try:
        ensure_configured()
        messages = normalize_messages([message.model_dump() for message in payload.messages])
    except ChatGatewayError as error:
        status = 503 if "未配置" in str(error) else 400
        raise HTTPException(status_code=status, detail=str(error)) from error

    def event_stream() -> Iterator[str]:
        try:
            for delta in stream_chat_reply(messages):
                yield f"data: {json.dumps({'delta': delta}, ensure_ascii=False)}\n\n"
        except ChatGatewayError as error:
            yield f"data: {json.dumps({'error': str(error)}, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
```

说明：`event_stream` 是同步生成器，Starlette 会自动放入线程池迭代，配合现有 urllib 阻塞式调用，无需引入 httpx。

### 4.3 新建 `app/ai-chat-widget.tsx`（完整文件）

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
const WELCOME = "你好，我是 BioCompare 内置助手，可以解答生物类似药 CMC 比对相关的概念、方法与工作台使用问题。具体数据结论请以页面内引擎计算结果为准。";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: WELCOME }]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [messages, open]);
  useEffect(() => () => abortRef.current?.abort(), []);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    setError("");
    const history = [...messages, { role: "user" as const, content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        const detail = await response.json().catch(() => null) as { detail?: string } | null;
        throw new Error(detail?.detail || `请求失败（HTTP ${response.status}）`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";
        for (const event of events) {
          const line = event.split("\n").find((candidate) => candidate.startsWith("data:"));
          if (!line) continue;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") continue;
          let parsed: { delta?: string; error?: string } | null = null;
          try { parsed = JSON.parse(payload) as { delta?: string; error?: string }; } catch { continue; }
          if (parsed.error) throw new Error(parsed.error);
          if (parsed.delta) setMessages((current) => {
            const next = [...current];
            const last = next[next.length - 1];
            next[next.length - 1] = { role: "assistant", content: (last?.content || "") + parsed.delta };
            return next;
          });
        }
      }
    } catch (caught) {
      if (!(caught instanceof DOMException && caught.name === "AbortError")) {
        setError(caught instanceof Error ? caught.message : "发送失败，请稍后重试。");
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      setMessages((current) => {
        const last = current[current.length - 1];
        return last && last.role === "assistant" && !last.content ? current.slice(0, -1) : current;
      });
    }
  }

  return <>
    {open && <section className="ai-chat-panel" aria-label="AI 助手对话面板">
      <header className="ai-chat-head">
        <span className="ai-chat-dot" />
        <div><strong>AI 助手</strong><small>药学比对问答 · 仅供参考</small></div>
        <button className="quiet" disabled={streaming} onClick={() => { setMessages([{ role: "assistant", content: WELCOME }]); setError(""); }}>清空</button>
        <button className="ai-chat-close" onClick={() => setOpen(false)} aria-label="关闭 AI 助手">×</button>
      </header>
      <div className="ai-chat-body" ref={scrollRef}>
        {messages.map((message, index) => <div key={index} className={`ai-chat-bubble ${message.role}`}>
          <pre>{message.content || (streaming && index === messages.length - 1 ? "…" : "")}</pre>
        </div>)}
        {error && <div className="ai-chat-error">{error}</div>}
      </div>
      <footer className="ai-chat-input">
        <textarea rows={2} placeholder="输入问题，Enter 发送，Shift+Enter 换行" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} disabled={streaming} />
        {streaming
          ? <button className="quiet" onClick={() => abortRef.current?.abort()}>停止</button>
          : <button className="primary" disabled={!input.trim()} onClick={() => void send()}>发送</button>}
      </footer>
    </section>}
    <button className="ai-chat-fab" onClick={() => setOpen(!open)} aria-label={open ? "关闭 AI 助手" : "打开 AI 助手"} title="AI 助手">AI</button>
  </>;
}
```

### 4.4 修改 `app/workspace-shell.tsx`

1. 顶部新增导入：`import { AiChatWidget } from "@/app/ai-chat-widget";`
2. 在 `return <div className={\`app-shell ...\`}>` 树的**末尾、`</div>` 闭合之前**（即 `<footer className="app-footer">…</footer>` 之后）加一行：

```tsx
      <AiChatWidget />
```

组件是 `position: fixed` 浮动元素，挂在 Shell 内即可让 `/project` 及所有路由都出现。

### 4.5 在 `app/globals.css` 文件末尾追加

```css
/* AI chat widget */
.ai-chat-fab{position:fixed;right:24px;bottom:24px;z-index:70;width:54px;height:54px;border:0;border-radius:16px;background:linear-gradient(145deg,var(--teal2),var(--teal));color:#fff;font-weight:700;font-size:14px;letter-spacing:.5px;box-shadow:0 10px 26px #087f7640;cursor:pointer;transition:.18s}
.ai-chat-fab:hover{transform:translateY(-2px);box-shadow:0 14px 30px #087f7659}
.ai-chat-panel{position:fixed;right:24px;bottom:90px;z-index:70;width:min(384px,calc(100vw - 32px));height:min(560px,calc(100vh - 130px));display:flex;flex-direction:column;background:var(--white);border:1px solid var(--line);border-radius:16px;box-shadow:0 18px 48px #142e3b2e;overflow:hidden}
.ai-chat-head{display:flex;align-items:center;gap:10px;padding:12px 14px;background:var(--nav);color:#dcebea}
.ai-chat-head strong{display:block;font-size:13px;color:#fff}
.ai-chat-head small{display:block;color:#8ea9ae;font-size:10px}
.ai-chat-dot{width:9px;height:9px;border-radius:50%;background:var(--teal2);box-shadow:0 0 8px var(--teal2);flex:none}
.ai-chat-head .quiet{margin-left:auto}
.ai-chat-close{border:0;background:transparent;color:#8ea9ae;font-size:16px;line-height:1;cursor:pointer;padding:2px 4px}
.ai-chat-body{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:var(--paper)}
.ai-chat-bubble{max-width:86%;padding:9px 12px;border-radius:12px;font-size:12.5px;line-height:1.65}
.ai-chat-bubble pre{margin:0;white-space:pre-wrap;word-break:break-word;font-family:inherit}
.ai-chat-bubble.assistant{align-self:flex-start;background:var(--white);border:1px solid var(--line);color:var(--ink);border-top-left-radius:4px}
.ai-chat-bubble.user{align-self:flex-end;background:var(--teal);color:#fff;border-top-right-radius:4px}
.ai-chat-error{align-self:center;max-width:92%;font-size:11px;line-height:1.5;color:#b3452e;background:#b3452e14;border:1px solid #b3452e33;padding:6px 10px;border-radius:10px;text-align:center}
.ai-chat-input{display:flex;gap:8px;align-items:flex-end;padding:10px;border-top:1px solid var(--line);background:var(--white)}
.ai-chat-input textarea{flex:1;resize:none;border:1px solid var(--line);border-radius:10px;padding:8px 10px;font-size:12.5px;line-height:1.5;background:var(--paper);color:var(--ink);outline:none}
.ai-chat-input textarea:focus{border-color:var(--teal2)}
.ai-chat-input button{flex:none}
@media (max-width:640px){.ai-chat-fab{right:16px;bottom:16px}.ai-chat-panel{right:16px;left:16px;width:auto;bottom:82px}}
```

注：`quiet` / `primary` 按钮类复用现有全局样式；所有颜色均使用 CSS 变量以自动适配深色主题。

---

## 5. 验收标准（全部满足才算完成）

1. **类型检查通过**：项目根目录执行 `pnpm typecheck`，无新增报错。
2. **后端接口可用**（重启后端后验证，见第 6 节）：

   ```bash
   curl -N -X POST http://127.0.0.1:8000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"用一句话介绍什么是生物类似药"}]}'
   ```

   预期：返回 `text/event-stream`，逐块输出 `data: {"delta": "…"}`，最后一条为 `data: [DONE]`。
3. **页面功能**：打开 `http://localhost:3000/project`，右下角出现「AI」浮动按钮；点击展开面板，发送问题后回答**逐字流式**出现；多轮对话有上下文；「停止」可中断；「清空」恢复欢迎语；Enter 发送、Shift+Enter 换行。
4. **错误路径**：临时清空 `.env.local` 中的 `AI_API_KEY` 重启后端后，发送消息应显示「AI 助手未配置…」而非白屏或无响应；恢复配置后一切正常。
5. **无回归**：上传材料、一键执行、导出 Word、主题切换（浅色/深色）等既有功能不受影响；除上述 5 个文件外 `git status`（或目录对比）无其他改动。
6. **不新增依赖**：`package.json` 与 Python 环境无任何新增包。

## 6. 重启与验证步骤

1. 停掉现有前端/后端进程（或在任务管理器结束 `node.exe`/`python.exe` 中本项目进程）。
2. 双击项目根目录 `Start-BioCompare.cmd`（它会加载 `.env.local` 并启动 uvicorn:8000 与 next:3000）。
3. 先跑第 5 节第 2 条的 curl，再打开 http://localhost:3000/project 做页面验收。

## 7. 明确不做（本期范围外，留作二期）

- 不做对话历史持久化（刷新即清空）。
- 不把项目实时状态（任务结果、汇总数据）注入对话上下文。
- 不做 Markdown 渲染、代码高亮、附件上传。
- 不做多用户、鉴权与限流（当前是本地单机环境）。

二期可选方向（仅供参考，本次不实现）：从 `useProject()` 取当前项目摘要注入 system prompt，让助手能回答"我这个项目跑到哪了"；对申报材料做检索增强（RAG）；对话记录落盘到 `.runtime`。
