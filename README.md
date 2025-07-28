# CodeAudits Action

[![CI](https://github.com/actions/hello-world-docker-action/actions/workflows/ci.yml/badge.svg)](https://github.com/actions/hello-world-docker-action/actions/workflows/ci.yml)

A GitHub Action that parses your repository's code and submits it to [CodeAudits.ai](https://codeaudits.ai/) for analysis.

Here's [CodeAudits documentation](https://codeaudits.ai/docs/howto) about how to use this GH Action.

## Overview

This action uses the [Repomix](https://github.com/yamadashy/repomix) library to generate a comprehensive text representation of your codebase and optionally submits it to CodeAudits.ai. This allows you to:

- Create a single document containing your entire codebase in a readable format
- Analyze your code structure and organization
- Submit your code for automated auditing and analysis through CodeAudits.ai

## Usage

Add the following to your GitHub Actions workflow file:

```yaml
name: CodeAudits Analysis

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  # Or use workflow_dispatch to trigger manually
  workflow_dispatch:

jobs:
  analyze:
    runs-on: ubuntu-latest
    name: Analyze code with CodeAudits
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Fetch all history for thorough analysis
      
      - name: Parse and submit repository
        uses: codeaudits/codeaudits-action@v1
        id: audit
        with:
          style: markdown            # Format of the parsed output
          compress: true             # Enable intelligent code parsing to reduce tokens
          llm-instruction: architecture-refactoring  # Optional: AI analysis instruction
          gemini-api-key: ${{ secrets.GEMINI_API_KEY }}  # Optional: for AI analysis
      
      - name: Upload parsed file as artifact
        uses: actions/upload-artifact@v4
        with:
          name: codebase-analysis
          path: parsed-repo.txt
```

## Inputs

| Input | Description | Default | Required |
|-------|-------------|---------|----------|
| `style` | Parsed document style. Use 'markdown', 'xml' or 'plain' | `markdown` | No |
| `compress` | Run intelligent code parsing to reduce tokens | `false` | No |
| `working-directory` | The directory in which to run the action. Defaults to the repository root | `.` | No |
| `llm-instruction` | The name of the instruction file for the Gemini prompt (see [Available Instructions](#available-instructions)) | | No |
| `gemini-api-key` | Gemini API key for AI-powered code analysis | | No |

## Outputs

| Output | Description |
|--------|-------------|
| `parse-metadata` | Metadata of the parsed repository |
| `parsed-file-name` | Name of the parsed output file |
| `submission-status` | Result of the submission to CodeAudits |

## Available Instructions

When using the `llm-instruction` input, you can choose from the following predefined instruction files:

- `architecture-refactoring` - Analysis focused on architectural improvements and refactoring opportunities
- `dry-kiss-yagni` - Review based on DRY, KISS, and YAGNI principles
- `essential-software-patterns` - Analysis of software design patterns usage
- `functionalities-analysis` - Comprehensive functionality and feature analysis
- `missing-tests` - Identification of missing test coverage and testing opportunities
- `possible-bugs` - Detection of potential bugs and code issues
- `simplification-hints` - Suggestions for code simplification and optimization
- `solid` - Review based on SOLID principles

**Note:** If you provide an invalid instruction name, the action will fail with a helpful error message listing all available options.

## Examples

### Basic Analysis

```yaml
- name: Run CodeAudits Analysis
  uses: codeaudits/codeaudits-action@v1
  with:
    style: markdown
```

### AI-Powered Code Analysis

```yaml
- name: Run AI-Powered Code Analysis
  uses: codeaudits/codeaudits-action@v1
  with:
    style: markdown
    compress: true
    llm-instruction: architecture-refactoring
    gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
```

**Setting up Gemini API Key:**
1. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add it as a repository secret named `GEMINI_API_KEY`
3. The AI analysis results will appear in the GitHub Actions job summary

## Viewing Results

After the action completes:

1. The parsed repository will be available as a GitHub Actions artifact named `parsed-repo.txt`
2. Detailed metadata about the parsing process will be available in the job outputs

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
