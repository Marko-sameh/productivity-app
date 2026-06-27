export function classifyCommit(message: string): string | null {
  if (!message) return null;
  
  // 1. Try strict conventional commits format (e.g., "feat(ui): ...")
  const match = message.match(/^(feat|fix|perf|refactor|style|docs|chore|test|ci)(\([^)]+\))?:/i);
  if (match) {
    return match[1].toLowerCase();
  }
  
  // 2. Fallback to keyword matching for manual entries
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("fix") || lowerMessage.includes("bug") || lowerMessage.includes("issue") || lowerMessage.includes("crash") || lowerMessage.includes("resolve")) {
    return "fix";
  }
  if (lowerMessage.includes("add") || lowerMessage.includes("new") || lowerMessage.includes("feat") || lowerMessage.includes("implement") || lowerMessage.includes("create")) {
    return "feat";
  }
  if (lowerMessage.includes("optimiz") || lowerMessage.includes("speed") || lowerMessage.includes("perf") || lowerMessage.includes("fast")) {
    return "perf";
  }
  if (lowerMessage.includes("refactor") || lowerMessage.includes("clean") || lowerMessage.includes("rewrite") || lowerMessage.includes("restructure")) {
    return "refactor";
  }
  if (lowerMessage.includes("doc") || lowerMessage.includes("readme") || lowerMessage.includes("comment")) {
    return "docs";
  }
  
  return null;
}
