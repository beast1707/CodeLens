import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FileCode } from 'lucide-react'

// Convert flat file list into a nested tree structure
const buildTree = (files) => {
  const root = {}

  files.forEach(file => {
    const parts = file.filePath.split('/')
    let current = root

    parts.forEach((part, idx) => {
      const isFile = idx === parts.length - 1

      if (isFile) {
        current[part] = { __isFile: true, __fileData: file }
      } else {
        if (!current[part]) current[part] = {}
        current = current[part]
      }
    })
  })

  return root
}

const TreeNode = ({ name, node, depth, onFileClick, activeFileId }) => {
  const [expanded, setExpanded] = useState(depth < 1)

  if (node.__isFile) {
    const isActive = node.__fileData._id === activeFileId
    return (
      <div
        onClick={() => onFileClick(node.__fileData)}
        className="flex items-center gap-2 px-2 py-1 text-sm cursor-pointer rounded"
        style={{
          paddingLeft: `${depth * 14 + 8}px`,
          color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
          background: isActive ? 'var(--bg-raised)' : 'transparent'
        }}
      >
        <FileCode size={13} style={{ flexShrink: 0, color: isActive ? 'var(--signal)' : 'var(--text-muted)' }} />
        <span className="truncate font-mono text-xs">{name}</span>
      </div>
    )
  }

  const entries = Object.entries(node)

  return (
    <div>
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 px-2 py-1 text-sm cursor-pointer"
        style={{ paddingLeft: `${depth * 14 + 4}px`, color: 'var(--text-muted)' }}
      >
        {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        <Folder size={13} />
        <span className="text-xs font-medium">{name}</span>
      </div>

      {expanded && (
        <div>
          {entries.map(([childName, childNode]) => (
            <TreeNode
              key={childName}
              name={childName}
              node={childNode}
              depth={depth + 1}
              onFileClick={onFileClick}
              activeFileId={activeFileId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const FileTree = ({ files, onFileClick, activeFileId }) => {
  const tree = buildTree(files)
  const entries = Object.entries(tree)

  return (
    <div className="py-2">
      {entries.map(([name, node]) => (
        <TreeNode
          key={name}
          name={name}
          node={node}
          depth={0}
          onFileClick={onFileClick}
          activeFileId={activeFileId}
        />
      ))}
    </div>
  )
}

export default FileTree