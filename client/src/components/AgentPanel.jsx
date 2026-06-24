import { useState, useRef, useEffect } from "react";
import { Send, History, MessageSquare, GitBranch } from "lucide-react";
import api from "../utils/axios";
import ChatMessage from "./ChatMessage";
import HistoryDrawer from "./HistoryDrawer";
import FlowDiagram from "./FlowDiagram";

const AgentPanel = ({ repositoryId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState("chat"); 
  const scrollRef = useRef(null);
  const messageRefs = useRef([]);

  useEffect(() => {
    fetchHistory();
  }, [repositoryId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "instant",
    });
  }, [historyLoaded]);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get(`/repositories/${repositoryId}/chat`);
      setMessages(data);
    } catch (err) {
      console.error("Failed to load chat history:", err);
    } finally {
      setHistoryLoaded(true);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const query = input;
    setInput("");
    setLoading(true);

    try {
      if (mode === "chat") {
        const { data } = await api.post(`/repositories/${repositoryId}/chat`, {
          question: query,
        });
        setMessages((prev) => [...prev, data]);
      } else {
        const { data } = await api.post(`/repositories/${repositoryId}/flow`, {
          query,
        });
        setMessages((prev) => [...prev, data]);
      }
      scrollToBottom();
    } catch (err) {
      console.error("Request failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMessage = (idx) => {
    setDrawerOpen(false);
    messageRefs.current[idx]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="h-full flex flex-col relative">
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <span
          className="text-xs font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          AI ASSISTANT
        </span>
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          style={{ color: "var(--text-muted)" }}
        >
          <History size={15} />
        </button>
      </div>

      <HistoryDrawer
        messages={messages}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSelectMessage={handleSelectMessage}
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4">
        {!historyLoaded ? (
          <div className="h-full flex items-center justify-center">
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              Loading conversation...
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              Ask anything about this codebase
            </span>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg._id || idx}
              ref={(el) => (messageRefs.current[idx] = el)}
            >
              {msg.type === "flow" ? (
                <div className="py-2">
                  <div className="flex justify-end mb-2">
                    <div
                      className="max-w-[85%] px-3.5 py-2 text-sm rounded"
                      style={{
                        background: "var(--bg-raised)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {msg.question}
                    </div>
                  </div>
                  <FlowDiagram
                    title={msg.flowData.title}
                    steps={msg.flowData.steps}
                  />
                </div>
              ) : (
                <ChatMessage {...msg} />
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="py-4">
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              {mode === "chat" ? "Thinking..." : "Generating flow..."}
            </span>
          </div>
        )}
      </div>

      {/* Mode toggle + input */}
      <div
        className="px-4 py-3 shrink-0"
        style={{ borderTop: "1px solid var(--line)" }}
      >
        <div className="flex gap-1 mb-2">
          <button
            onClick={() => setMode("chat")}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition"
            style={{
              background: mode === "chat" ? "var(--bg-raised)" : "transparent",
              color: mode === "chat" ? "var(--signal)" : "var(--text-muted)",
            }}
          >
            <MessageSquare size={12} />
            Chat
          </button>
          <button
            onClick={() => setMode("flow")}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition"
            style={{
              background: mode === "flow" ? "var(--bg-raised)" : "transparent",
              color: mode === "flow" ? "var(--signal)" : "var(--text-muted)",
            }}
          >
            <GitBranch size={12} />
            Flow
          </button>
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "chat"
                ? "Ask about this codebase..."
                : 'Describe a flow, e.g. "login flow"'
            }
            className="flex-1 px-3 py-2 text-sm rounded outline-none"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--line)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--signal)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 rounded transition disabled:opacity-30"
            style={{
              background: "var(--text-primary)",
              color: "var(--bg-void)",
            }}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgentPanel;
