import * as core from '@actions/core'
import { ICoreInterface, ISummary } from '../interfaces/core.interface.js'

/**
 * Adapter to make GitHub Actions core compatible with our interface
 * This bridges the gap between the external library and our internal interface
 */
export class GitHubActionsCore implements ICoreInterface {
  constructor(private coreImpl = core) {}

  getInput(name: string): string {
    return this.coreImpl.getInput(name)
  }

  getBooleanInput(name: string): boolean {
    return this.coreImpl.getBooleanInput(name)
  }

  setOutput(name: string, value: string): void {
    this.coreImpl.setOutput(name, value)
  }

  setFailed(message: string): void {
    this.coreImpl.setFailed(message)
  }

  debug(message: string): void {
    this.coreImpl.debug(message)
  }

  info(message: string): void {
    this.coreImpl.info(message)
  }

  error(message: string): void {
    this.coreImpl.error(message)
  }

  summary: ISummary = {
    addHeading: (heading: string, level?: number) => {
      this.coreImpl.summary.addHeading(heading, level)
      return this.summary
    },
    addTable: (table: any) => {
      this.coreImpl.summary.addTable(table)
      return this.summary
    },
    addBreak: () => {
      this.coreImpl.summary.addBreak()
      return this.summary
    },
    addRaw: (raw: string, addEOL?: boolean) => {
      this.coreImpl.summary.addRaw(raw, addEOL)
      return this.summary
    },
    addCodeBlock: (code: string, lang?: string) => {
      this.coreImpl.summary.addCodeBlock(code, lang)
      return this.summary
    },
    addLink: (text: string, url: string) => {
      this.coreImpl.summary.addLink(text, url)
      return this.summary
    },
    write: async () => {
      await this.coreImpl.summary.write()
    }
  }
}
