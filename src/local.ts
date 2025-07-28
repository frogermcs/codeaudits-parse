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
  .version('1.2.0')

program
  .option('-s, --style <style>', 'Output style', 'plain')
  .option('-c, --compress', 'Enable compression', false)
  .option('-w, --working-directory <dir>', 'Working directory', '.')
  .option('-o, --output <file>', 'Output file name', 'parsed-repo.txt')
  .option('-i, --instruction <name>', 'Name of the predefined instruction file for Gemini prompt')
  .option('--custom-instruction <name>', 'Name of the custom instruction file from /.codeaudits/instructions directory')
  .action(async (options) => {
    try {
      await runLocal(options)
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    }
  })

program.parse()
