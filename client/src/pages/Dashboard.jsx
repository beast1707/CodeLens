import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Plus, FileCode2, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/axios'

const STATUS_STYLES = {
  pending: { label: 'Pending', color: '#8B8D93' },
  processing: { label: 'Processing', color: '#FBBF24' },
  ready: { label: 'Ready', color: '#5EEAD4' },
  failed: { label: 'Failed', color: '#F87171' }
}

const Dashboard = () => {
  const [repos, setRepos] = useState([])
  const [githubUrl, setGithubUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchRepos()
  }, [])

  useEffect(() => {
    const hasProcessing = repos.some(r => r.status === 'pending' || r.status === 'processing')
    if (!hasProcessing) return
    const interval = setInterval(fetchRepos, 3000)
    return () => clearInterval(interval)
  }, [repos])

  const fetchRepos = async () => {
    try {
      const { data } = await api.get('/repositories')
      setRepos(data)
    } catch (err) {
      console.error('Failed to fetch repositories:', err)
    }
  }

  const handleImport = async (e) => {
    e.preventDefault()
    setError('')
    setImporting(true)
    try {
      await api.post('/repositories/import', { githubUrl })
      setGithubUrl('')
      fetchRepos()
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const handleDelete = async (repoId) => {
    const confirmed = window.confirm('Delete this repository? This will remove all its data and cannot be undone.')
    if (!confirmed) return

    try {
      await api.delete(`/repositories/${repoId}`)
      setRepos(prev => prev.filter(r => r._id !== repoId))
    } catch (err) {
      console.error('Failed to delete repository:', err)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen px-6 py-8" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-medium tracking-tight" style={{ color: 'var(--text-primary)' }}>
            CodeLens <span style={{ color: 'var(--signal)' }}>AI</span>
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm px-3 py-1.5 rounded transition"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--line)' }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>

        <div className="mb-12">
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            Paste a GitHub repository URL to start exploring
          </p>
          <form onSubmit={handleImport} className="flex gap-2">
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/owner/repository"
              required
              className="flex-1 px-4 py-2.5 text-sm rounded outline-none font-mono"
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--line)', color: 'var(--text-primary)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--signal)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--line)'}
            />
            <button
              type="submit"
              disabled={importing}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded transition disabled:opacity-50"
              style={{ background: 'var(--text-primary)', color: 'var(--bg-void)' }}
            >
              <Plus size={16} />
              {importing ? 'Importing...' : 'Import'}
            </button>
          </form>
          {error && <p className="mt-2 text-sm" style={{ color: '#F87171' }}>{error}</p>}
        </div>

        {repos.length === 0 ? (
          <div className="text-center py-16 rounded" style={{ border: '1px solid var(--line)', color: 'var(--text-muted)' }}>
            <FileCode2 size={28} className="mx-auto mb-3" style={{ color: 'var(--line)' }} />
            <p className="text-sm">No repositories imported yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {repos.map(repo => (
              <RepoCard
                key={repo._id}
                repo={repo}
                onOpen={() => navigate(`/repository/${repo._id}`)}
                onDelete={() => handleDelete(repo._id)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

const RepoCard = ({ repo, onOpen, onDelete }) => {
  const status = STATUS_STYLES[repo.status] || STATUS_STYLES.pending
  const isReady = repo.status === 'ready'

  return (
    <div className="p-4 rounded" style={{ background: 'var(--bg-panel)', border: '1px solid var(--line)' }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{repo.name}</h3>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
          <span className="text-xs" style={{ color: status.color }}>{status.label}</span>
        </div>
      </div>

      <p className="text-xs font-mono mb-3" style={{ color: 'var(--text-muted)' }}>
        {repo.repoOwner}/{repo.repoName}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {repo.totalFiles > 0 ? `${repo.totalFiles} files` : '—'}
          {repo.language && ` · ${repo.language}`}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onDelete}
            className="p-1.5 rounded transition"
            style={{ color: 'var(--text-muted)' }}
            title="Delete repository"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={onOpen}
            disabled={!isReady}
            className="text-xs px-3 py-1.5 rounded transition disabled:opacity-30"
            style={{ border: '1px solid var(--line)', color: 'var(--text-primary)' }}
          >
            Open
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard