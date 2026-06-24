import { FileCode } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

// Map our detected language to what the highlighter expects
const LANGUAGE_MAP = {
  javascript: 'jsx',
  typescript: 'tsx',
  python: 'python',
  java: 'java',
  json: 'json',
  css: 'css',
  html: 'html',
  markdown: 'markdown',
  yaml: 'yaml',
  shell: 'bash'
}

const FileViewer = ({ file }) => {
  if (!file) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Select a file to view its content
        </span>
      </div>
    )
  }

  const language = LANGUAGE_MAP[file.language] || 'text'

  return (
    <div className="h-full flex flex-col overflow-hidden">

      <div
        className="flex items-center gap-2 px-4 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid var(--line)' }}
      >
        <FileCode size={14} style={{ color: 'var(--signal)' }} />
        <span className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>
          {file.filePath}
        </span>
      </div>

      {(file.functions?.length > 0 || file.classes?.length > 0) && (
        <div
          className="flex flex-wrap gap-1.5 px-4 py-2.5 shrink-0"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          {file.classes?.map(cls => (
            <span
              key={cls}
              className="text-xs px-2 py-0.5 rounded font-mono"
              style={{ background: 'var(--bg-raised)', color: 'var(--signal)' }}
            >
              {cls}
            </span>
          ))}
          {file.functions?.map(fn => (
            <span
              key={fn}
              className="text-xs px-2 py-0.5 rounded font-mono"
              style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)' }}
            >
              {fn}()
            </span>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '12px 16px',
            background: 'transparent',
            fontSize: '12px',
            lineHeight: '1.6'
          }}
          codeTagProps={{
            style: { fontFamily: 'JetBrains Mono, monospace' }
          }}
        >
          {file.content}
        </SyntaxHighlighter>
      </div>

    </div>
  )
}

export default FileViewer