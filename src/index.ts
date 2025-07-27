/**
 * The entrypoint for the action. This file simply imports and runs the action's
 * main logic.
 */
import dotenv from 'dotenv'
import { run } from './main.js'

// Load environment variables from .env file (for local development)
dotenv.config()

/* istanbul ignore next */
run()

// Main exports for the codeaudits-parse library
export { run, runLocal } from './main.js'
export { CodeAuditsParseApp } from './app/codeaudits-parse.app.js'
export { RepositoryParser } from './services/repository-parser.service.js'
export { LocalCore } from './core/local-core.js'
export { GitHubActionsCore } from './core/github-actions-core.js'
export type { ICoreInterface, ISummary } from './interfaces/core.interface.js'
export type { ActionOptions } from './app/codeaudits-parse.app.js'
export type { RepositoryParseOptions, ParseResult } from './services/repository-parser.service.js'
