import { X, MessageSquare } from 'lucide-react'

const HistoryDrawer = ({ messages, isOpen, onClose, onSelectMessage }) => {
  if (!isOpen) return null

  return (
    <div
      className="absolute top-0 left-0 h-full w-64 z-10 flex flex-col"
      style={{ background: 'var(--bg-panel)', borderRight: '1px solid var(--line)' }}
    >
      <div
        className="flex items-center justify-between px-3 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid var(--line)' }}
      >
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          QUESTIONS
        </span>
        <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {messages.length === 0 ? (
          <p className="text-xs px-3 py-3" style={{ color: 'var(--text-muted)' }}>
            No questions yet
          </p>
        ) : (
          messages.map((msg, idx) => (
            <button
              key={msg._id || idx}
              onClick={() => onSelectMessage(idx)}
              className="w-full text-left flex items-start gap-2 px-3 py-2 transition"
              style={{ color: 'var(--text-primary)' }}
            >
              <MessageSquare size={13} className="mt-0.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs leading-snug line-clamp-2">{msg.question}</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default HistoryDrawer