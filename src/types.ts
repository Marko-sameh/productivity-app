export interface Impact {
  id: string;
  category: string;
  notes: string | null;
  createdAt: string | Date;
  commitHash: string;
}

export interface Deployment {
  id: string;
  environment: string; // "dev" | "production"
  deployedAt: string | Date;
  commitHash: string;
}

export interface Release {
  id: string;
  name: string;
  date: string | Date;
}

export interface Commit {
  hash: string;
  repo: string;
  branch: string | null;
  date: string | Date;
  message: string;
  type: string | null; // e.g., feat, fix, perf, refactor, style, docs
  author: string;
  filesChanged: number;
  prId: string | null;
  module: string | null;
  priority: string | null; // Low, Medium, High, Critical
  estimatedHours: number | null;
  actualHours: number | null;
  status: string | null; // To Do, In Progress, Done
  evidenceUrl: string | null;
  releaseId?: string | null;
  release?: Release | null;
  impacts?: Impact[];
  deployments?: Deployment[];
}
