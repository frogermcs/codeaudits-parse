#!/usr/bin/env node

/**
 * Local CLI runner for codeaudits-parse
 * This allows running the tool locally without GitHub Actions environment
 */

import dotenv from 'dotenv'
import { Command } from 'commander'
import { runLocal } from './main.js'

// Load environment variables from .env file
dotenv.config()

const program = new Command()

program
  .name('codeaudits-parse')
  .description('Parse repository code')
  .version('2.0.0')

program
  .option('-s, --style <style>', 'Output style', 'plain')
  .option('-c, --compress', 'Enable compression', false)
  .option('-w, --working-directory <dir>', 'Working directory', '.')
  .option('-o, --output <file>', 'Output file name', 'parsed-repo.txt')
  .option('-i, --prompt <name>', 'Name of the predefined prompt file for Gemini prompt')
  .option('--custom-prompt <name>', 'Name of the custom prompt file from /.codeaudits/prompts directory')
  .option('--include-files <files>', 'Space-separated list of files to include in the analysis')
  .action(async (options) => {
    try {
      // Convert includeFiles string to array if provided
      if (options.includeFiles) {
        options.includeFiles = options.includeFiles.split(/\s+/).filter((file: string) => file.trim().length > 0)
      }
      await runLocal(options)
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    }
  })

program.parse()
