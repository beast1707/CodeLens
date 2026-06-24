import { FileCode } from 'lucide-react'

const ChatMessage = ({ question, answer, sourcesUsed }) => {
  return (
    <div className="py-4">

      {/* User question */}
      <div className="flex justify-end mb-3">
        <div
          className="max-w-[85%] px-3.5 py-2 text-sm rounded"
          style={{ background: 'var(--bg-raised)', color: 'var(--text-primary)' }}
        >
          {question}
        </div>
      </div>

      {/* AI answer */}
      <div className="max-w-[95%]">
        <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {answer}
        </p>

        {sourcesUsed?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {sourcesUsed.map(src => (
              <span
                key={src}
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded font-mono"
                style={{ background: 'var(--bg-panel)', border: '1px solid var(--line)', color: 'var(--text-muted)' }}
              >
                <FileCode size={10} />
                {src.split('/').pop()}
              </span>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default ChatMessage