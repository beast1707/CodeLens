import dotenv from 'dotenv';

dotenv.config();

import axios from "axios";

const githubApi = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
  },
});


const IGNORED_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".webp",
  ".mp4",
  ".mp3",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".lock",
  ".log",
];

const IGNORED_FOLDERS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
  "__pycache__",
  ".venv",
];

const IGNORED_FILENAMES = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '.gitignore',
  '.env.example',
  'LICENSE'
]


const detectLanguage = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  const langMap = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
    cs: "csharp",
    go: "go",
    rb: "ruby",
    php: "php",
    html: "html",
    css: "css",
    json: "json",
    md: "markdown",
    yaml: "yaml",
    yml: "yaml",
    sh: "shell",
    env: "env",
  };
  return langMap[ext] || "unknown";
};


const extractFunctions = (content, language) => {
  const functions = [];

  try {
    if (language === "javascript" || language === "typescript") {
     
      const patterns = [
        /(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
        /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?\(/g,
        /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?\(/g,
        /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*(?:async\s*)?function/g,
        /export\s+(?:default\s+)?(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      ];
      patterns.forEach((pattern) => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          if (match[1] && !functions.includes(match[1])) {
            functions.push(match[1]);
          }
        }
      });
    }

    if (language === "python") {
      const pattern = /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (!functions.includes(match[1])) functions.push(match[1]);
      }
    }

    if (language === "java" || language === "csharp") {
      const pattern =
        /(?:public|private|protected|static|\s)+[\w<>\[\]]+\s+(\w+)\s*\([^)]*\)\s*\{/g;
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (!functions.includes(match[1])) functions.push(match[1]);
      }
    }
  } catch (err) {
   
  }

  return functions.slice(0, 50); 
};


const extractClasses = (content, language) => {
  const classes = [];
  try {
    const pattern = /class\s+([A-Z][a-zA-Z0-9_]*)/g;

    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (!classes.includes(match[1])) classes.push(match[1]);
    }
  } catch (err) {}

  return classes;
};


const extractImports = (content, language) => {
  const imports = [];
  try {
    if (language === "javascript" || language === "typescript") {
      const patterns = [
        /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
        /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      ];
      patterns.forEach((pattern) => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          if (!imports.includes(match[1])) imports.push(match[1]);
        }
      });
    }

    if (language === "python") {
      const patterns = [
        /import\s+([a-zA-Z_][a-zA-Z0-9_.]*)/g,
        /from\s+([a-zA-Z_][a-zA-Z0-9_.]*)\s+import/g,
      ];
      patterns.forEach((pattern) => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          if (!imports.includes(match[1])) imports.push(match[1]);
        }
      });
    }
  } catch (err) {}

  return imports;
};


const shouldIgnoreFile = (filePath) => {
  const lowerPath = filePath.toLowerCase()
  const fileName = filePath.split('/').pop()


  if (IGNORED_FILENAMES.includes(fileName)) return true

  const pathParts = filePath.split('/')
  for (const part of pathParts) {
    if (IGNORED_FOLDERS.includes(part)) return true
  }


  for (const ext of IGNORED_EXTENSIONS) {
    if (lowerPath.endsWith(ext)) return true
  }

  return false
}


const getAllFiles = async (repoOwner, repoName, path = "") => {
  try {
    const url = path
      ? `/repos/${repoOwner}/${repoName}/contents/${path}`
      : `/repos/${repoOwner}/${repoName}/contents`;

    const { data } = await githubApi.get(url);
    let files = [];

    for (const item of data) {
      if (item.type === "dir") {
        if (!IGNORED_FOLDERS.includes(item.name)) {
          const subFiles = await getAllFiles(repoOwner, repoName, item.path);
          files = [...files, ...subFiles];
        }
      } else if (item.type === "file") {
        if (!shouldIgnoreFile(item.path)) {
          files.push(item);
        }
      }
    }

    return files;
  } catch (err) {
    console.error(`Error fetching files at path ${path}:`, err.message);
    return [];
  }
};


const fetchFileContent = async (downloadUrl) => {
  try {
    const { data } = await axios.get(downloadUrl);
    return typeof data === "string" ? data : JSON.stringify(data, null, 2);
  } catch (err) {
    return "";
  }
};


export const fetchAndAnalyzeRepo = async (repoOwner, repoName) => {
  
  const { data: repoData } = await githubApi.get(
    `/repos/${repoOwner}/${repoName}`,
  );

 
  console.log(`Fetching files from ${repoOwner}/${repoName}...`);
  const allFiles = await getAllFiles(repoOwner, repoName);
  console.log(`Found ${allFiles.length} files`);

 
  const analyzedFiles = [];

  for (const file of allFiles) {
    
    if (file.size > 100000) {
      console.log(`Skipping large file: ${file.path}`);
      continue;
    }

    const content = await fetchFileContent(file.download_url);
    if (!content) continue;

    const language = detectLanguage(file.name);
    const functions = extractFunctions(content, language);
    const classes = extractClasses(content, language);
    const imports = extractImports(content, language);

    analyzedFiles.push({
      fileName: file.name,
      filePath: file.path,
      language,
      size: file.size,
      functions,
      classes,
      imports,
      content,
    });

    console.log(`Analyzed: ${file.path}`);
  }

  return {
    repoMetadata: {
      name: repoData.name,
      description: repoData.description || "",
      language: repoData.language || "",
      stars: repoData.stargazers_count || 0,
    },
    files: analyzedFiles,
  };
};


export const parseGithubUrl = (url) => {
  try {
    const cleaned = url.replace(/\.git$/, "").trim();
    const parts = cleaned.split("/");
    const repoName = parts[parts.length - 1];
    const repoOwner = parts[parts.length - 2];

    if (!repoOwner || !repoName) throw new Error("Invalid URL");

    return { repoOwner, repoName };
  } catch (err) {
    throw new Error("Invalid GitHub URL format");
  }
};
