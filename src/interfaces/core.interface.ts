/**
 * Core interface for abstracting GitHub Actions core functionality
 * This allows us to use the same code for both GitHub Actions and local execution
 */
export interface ICoreInterface {
  getInput(name: string): string
  getBooleanInput(name: string): boolean
  setOutput(name: string, value: string): void
  setFailed(message: string): void
  debug(message: string): void
  info(message: string): void
  error(message: string): void
  summary: ISummary
}

export interface ISummary {
  addHeading(heading: string, level?: number): ISummary
  addTable(table: any): ISummary
  addBreak(): ISummary
  addRaw(raw: string, addEOL?: boolean): ISummary
  addCodeBlock(code: string, lang?: string): ISummary
  addLink(text: string, url: string): ISummary
  write(): Promise<void>
}
