import { Link } from 'react-router-dom'
import { ArrowRight, FileSearch, MessageSquare, GitBranch, FolderTree, Mail } from 'lucide-react'

const Landing = () => {
  return (
    <div style={{ background: 'var(--bg-void)', color: 'var(--text-primary)' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <span className="text-4xl font-medium tracking-tight">
          CodeLens <span style={{ color: 'var(--signal)' }}>AI</span>
        </span>
        <Link
          to="/login"
          className="text-sm px-4 py-2 rounded transition"
          style={{ border: '1px solid var(--line)', color: 'var(--text-primary)' }}
        >
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-20 text-center">
        <p className="text-xs tracking-wide mb-4" style={{ color: 'var(--signal)' }}>
          AI-POWERED CODEBASE EXPLORER
        </p>
        <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-6 leading-tight">
          Understand any codebase<br />in minutes, not days
        </h1>
        <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          1,200 files. 200 APIs. 50 services. Your manager says "understand the auth flow."
          CodeLens replaces two days of digital archaeology with a conversation.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded transition"
          style={{ background: 'var(--text-primary)', color: 'var(--bg-void)' }}
        >
          Get started
          <ArrowRight size={15} />
        </Link>
      </section>

      {/* Why it's different */}
      <section
        className="max-w-3xl mx-auto px-6 py-16"
        style={{ borderTop: '1px solid var(--line)' }}
      >
        <p className="text-xs tracking-wide mb-3" style={{ color: 'var(--signal)' }}>
          THE HARD PART
        </p>
        <h2 className="text-2xl font-medium mb-4">
          Code and questions don't speak the same language
        </h2>
        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
          A file named <span className="font-mono" style={{ color: 'var(--text-primary)' }}>auth.controller.js</span> might
          use <span className="font-mono" style={{ color: 'var(--text-primary)' }}>signUp</span>, <span className="font-mono" style={{ color: 'var(--text-primary)' }}>bcrypt</span>,
          and <span className="font-mono" style={{ color: 'var(--text-primary)' }}>jwt</span> — and never once say "authentication."
          Most AI code tools search raw code directly against your question, and quietly miss the file that actually matters.
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          CodeLens generates a plain-English summary of every file before indexing it — bridging the gap between
          how you ask and how the code is written. The summary finds the file. The real code answers the question.
        </p>
      </section>

      {/* Features */}
      <section
        className="max-w-3xl mx-auto px-6 py-16"
        style={{ borderTop: '1px solid var(--line)' }}
      >
        <p className="text-xs tracking-wide mb-8" style={{ color: 'var(--signal)' }}>
          WHAT IT DOES
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FeatureCard
            icon={<FolderTree size={18} />}
            title="Repository Explorer"
            description="A VS Code-style file tree with full syntax highlighting, alongside detected functions and classes."
          />
          <FeatureCard
            icon={<MessageSquare size={18} />}
            title="AI Assistant"
            description="Ask anything about the codebase in plain English. Every answer is grounded in real, retrieved source code — never invented."
          />
          <FeatureCard
            icon={<GitBranch size={18} />}
            title="Flow Visualization"
            description="Describe a feature flow and get an interactive diagram tracing it from UI to database."
          />
          <FeatureCard
            icon={<FileSearch size={18} />}
            title="Smart Import"
            description="Paste any public GitHub URL. CodeLens analyzes every file, extracting structure automatically."
          />
        </div>
      </section>

      {/* Tech stack */}
      <section
        className="max-w-3xl mx-auto px-6 py-12"
        style={{ borderTop: '1px solid var(--line)' }}
      >
        <p className="text-xs tracking-wide mb-4" style={{ color: 'var(--signal)' }}>
          BUILT WITH
        </p>
        <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
          React · Node.js · Express · MongoDB · Pinecone · Groq (Llama 3.3)
        </p>
      </section>

      {/* CTA */}
      <section
        className="max-w-3xl mx-auto px-6 py-16 text-center"
        style={{ borderTop: '1px solid var(--line)' }}
      >
        <h2 className="text-2xl font-medium mb-4">Stop reading code line by line</h2>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded transition"
          style={{ background: 'var(--text-primary)', color: 'var(--bg-void)' }}
        >
          Create a free account
          <ArrowRight size={15} />
        </Link>
      </section>

      {/* Footer */}
     <div className="flex items-center gap-4">
  <a href="mailto:ayushdurukkar@gmail.com" style={{ color: 'var(--text-muted)' }}>
    <Mail size={16} />
  </a>
  <a href="https://linkedin.com/in/ayush-durukkar-13bb97285/" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  </a>
  <a href="https://github.com/beast1707" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.769.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  </a>
</div>

    </div>
  )
}

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-4 rounded" style={{ background: 'var(--bg-panel)', border: '1px solid var(--line)' }}>
    <div className="mb-3" style={{ color: 'var(--signal)' }}>{icon}</div>
    <h3 className="text-sm font-medium mb-1.5">{title}</h3>
    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{description}</p>
  </div>
)

export default Landing