import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels'
import { ArrowLeft } from 'lucide-react'
import api from '../utils/axios'
import FileTree from '../components/FileTree'
import FileViewer from '../components/FileViewer'
import AgentPanel from '../components/AgentPanel'

const RepositoryWorkspace = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [repository, setRepository] = useState(null)
  const [files, setFiles] = useState([])
  const [activeFile, setActiveFile] = useState(null)

  useEffect(() => {
    fetchRepository()
    fetchFiles()
  }, [id])

  const fetchRepository = async () => {
    try {
      const { data } = await api.get(`/repositories/${id}`)
      setRepository(data)
    } catch (err) {
      console.error('Failed to fetch repository:', err)
    }
  }

  const fetchFiles = async () => {
    try {
      const { data } = await api.get(`/repositories/${id}/files`)
      setFiles(data)
    } catch (err) {
      console.error('Failed to fetch files:', err)
    }
  }

  const handleFileClick = async (file) => {
    try {
      const { data } = await api.get(`/repositories/${id}/files/${file._id}`)
      setActiveFile(data)
    } catch (err) {
      console.error('Failed to fetch file content:', err)
    }
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg-void)' }}>

      <div
        className="flex items-center gap-3 px-4 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid var(--line)' }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={15} />
        </button>
        <span className="text-sm font-medium font-mono" style={{ color: 'var(--text-primary)' }}>
          {repository?.name || '...'}
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">

          <Panel defaultSize={50} minSize={25}>
            <div className="h-full flex" style={{ background: 'var(--bg-panel)' }}>

              {/* File tree */}
              <div
                className="w-48 overflow-y-auto shrink-0"
                style={{ borderRight: '1px solid var(--line)' }}
              >
                <FileTree
                  files={files}
                  onFileClick={handleFileClick}
                  activeFileId={activeFile?._id}
                />
              </div>

              {/* File viewer */}
              <div className="flex-1 overflow-hidden">
                <FileViewer file={activeFile} />
              </div>

            </div>
          </Panel>

          <PanelResizeHandle className="resize-handle" />

          <Panel defaultSize={50} minSize={25}>
  <div className="h-full" style={{ background: 'var(--bg-void)' }}>
    <AgentPanel repositoryId={id} />
  </div>
</Panel>

        </PanelGroup>
      </div>

    </div>
  )
}

export default RepositoryWorkspace