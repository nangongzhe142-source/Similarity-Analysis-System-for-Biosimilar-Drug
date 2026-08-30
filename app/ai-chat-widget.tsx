"use client";

import { Fragment, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useProject } from "@/app/project-provider";
import { moduleResultSummary, projectModules } from "@/lib/project";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
const WELCOME = "你好，我是 BioCompare 内置助手，可以解答生物类似药 CMC 比对相关的概念、方法与工作台使用问题。具体数据结论请以页面内引擎计算结果为准。";

type MessageMeta = { model: string; contextChars: number; referencedProjects: number };
type ChatMessage = { role: "user" | "assistant"; content: string; meta?: MessageMeta };
type SsePayload = { delta?: string; error?: string; meta?: { model: string; contextChars: number } };

function inlineMarkup(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={index}>{part.slice(2, -2)}</strong>
      : <Fragment key={index}>{part}</Fragment>,
  );
}

function RichText({ content }: { content: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flushList = () => {
    if (!list.length) return;
    blocks.push(<ul key={`list-${blocks.length}`}>{list.map((item, index) => <li key={index}>{inlineMarkup(item)}</li>)}</ul>);
    list = [];
  };
  content.split("\n").forEach((line) => {
    if (/^\s*[-*]\s+/.test(line)) {
      list.push(line.replace(/^\s*[-*]\s+/, ""));
      return;
    }
    flushList();
    if (line.trim()) blocks.push(<p key={`p-${blocks.length}`}>{inlineMarkup(line)}</p>);
    else blocks.push(<div className="ai-chat-break" key={`br-${blocks.length}`} />);
  });
  flushList();
  return <div className="ai-chat-richtext">{blocks}</div>;
}

export function AiChatWidget() {
  const { runs } = useProject();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: WELCOME }]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const projectContext = useMemo(() => {
    const rows = projectModules.flatMap((module) => {
      const run = runs[module.id];
      const hasResult = Boolean(run?.result || run?.ptmResult || run?.sequenceResult || run?.ptmMapResult || run?.glycanResult || run?.chromatographyResult || run?.covalentResult);
      return run && hasResult && (run.status === "completed" || run.status === "attention")
        ? [{ code: module.code, line: `- ${module.code} ${module.name}：${moduleResultSummary(run)}${run.status === "attention" ? "（需关注）" : ""}` }]
        : [];
    });
    const text = `当前项目已形成结果 ${rows.length} 项。\n${rows.map((row) => row.line).join("\n")}`.slice(0, 2000);
    return { text, codes: rows.map((row) => row.code), count: rows.length };
  }, [runs]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [messages, open, streaming]);
  useEffect(() => () => abortRef.current?.abort(), []);

  function resizeInput(value: string) {
    setInput(value);
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 96)}px`;
  }

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    setError("");
    const history = [...messages, { role: "user" as const, content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    resizeInput("");
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })), contextSummary: projectContext.text }),
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
          let parsed: SsePayload | null = null;
          try { parsed = JSON.parse(payload) as SsePayload; } catch { continue; }
          if (parsed?.error) throw new Error(parsed.error);
          if (parsed?.delta) setMessages((current) => {
            const next = [...current];
            const last = next[next.length - 1];
            next[next.length - 1] = { ...last, role: "assistant", content: (last?.content || "") + parsed.delta };
            return next;
          });
          if (parsed?.meta) setMessages((current) => {
            const next = [...current];
            const last = next[next.length - 1];
            const referencedProjects = projectContext.codes.filter((code) => last.content.includes(code)).length;
            next[next.length - 1] = { ...last, meta: { ...parsed.meta!, referencedProjects } };
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
        <span className="ai-chat-avatar assistant" aria-hidden="true">AI</span>
        <div><strong>AI 助手</strong><small>已读取 {projectContext.count} 项当前结果 · 仅供参考</small></div>
        <button className="quiet" disabled={streaming} onClick={() => { setMessages([{ role: "assistant", content: WELCOME }]); setError(""); }}>清空</button>
        <button className="ai-chat-close" onClick={() => setOpen(false)} aria-label="关闭 AI 助手">×</button>
      </header>
      <div className="ai-chat-body" ref={scrollRef}>
        {messages.map((message, index) => <div key={index} className={`ai-chat-row ${message.role}`}>
          <span className={`ai-chat-avatar ${message.role}`} aria-hidden="true">{message.role === "assistant" ? "AI" : "我"}</span>
          <div className={`ai-chat-bubble ${message.role}`}>
            {message.content ? <RichText content={message.content} /> : streaming && index === messages.length - 1 ? <span className="ai-chat-typing" aria-label="AI 正在生成"><i /><i /><i /></span> : null}
            {message.meta && <small className="ai-chat-source">模型 {message.meta.model || "未知"} · 引用项目 {message.meta.referencedProjects} 项</small>}
          </div>
        </div>)}
        {error && <div className="ai-chat-error">{error}</div>}
      </div>
      <footer className="ai-chat-input">
        <textarea ref={textareaRef} rows={1} placeholder="输入问题，Enter 发送，Shift+Enter 换行" value={input} onChange={(event) => resizeInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} disabled={streaming} />
        {streaming
          ? <button className="quiet" onClick={() => abortRef.current?.abort()}>停止</button>
          : <button className="primary" disabled={!input.trim()} onClick={() => void send()}>发送</button>}
      </footer>
    </section>}
    <button className="ai-chat-fab" onClick={() => setOpen(!open)} aria-label={open ? "关闭 AI 助手" : "打开 AI 助手"} title="AI 助手">AI</button>
  </>;
}
