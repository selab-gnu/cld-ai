export type TodoSummary = { total: number; left: number }

declare module 'claude-code' {
  interface PluginState {
    'todo-mod': { summary: TodoSummary | null }
  }
}
