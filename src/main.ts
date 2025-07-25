import * as core from '@actions/core'
import { CodeAuditsParseApp } from './app/codeaudits-parse.app.js'
import { LocalCore } from './core/local-core.js'
import { GitHubActionsCore } from './core/github-actions-core.js'

/**
 * The main function for the action.
 * This is now a thin orchestration layer that delegates to the main app.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(coreImpl: any = core): Promise<void> {
  const adaptedCore = new GitHubActionsCore(coreImpl)
  const app = new CodeAuditsParseApp(adaptedCore)
  await app.execute()
}

/**
 * Local runner function for running without GitHub Actions
 * Creates a LocalCore instance and runs the main app
 */
export async function runLocal(options: any): Promise<void> {
  const localCore = new LocalCore(options)
  const app = new CodeAuditsParseApp(localCore)
  await app.execute()
}
