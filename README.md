# CodeAudits Action

[![CI](https://github.com/actions/hello-world-docker-action/actions/workflows/ci.yml/badge.svg)](https://github.com/actions/hello-world-docker-action/actions/workflows/ci.yml)

A GitHub Action that parses your repository's code and submits it to [CodeAudits.ai](https://codeaudits.ai/) for analysis.

Here's [CodeAudits documentation](https://codeaudits.ai/docs/howto) about how to use this GH Action.

## What's New in v2.0.0

- **🤖 AI-Powered Code Audits**: Integrate with Google Gemini for intelligent code analysis and insights
- **📝 Default Analysis Prompts**: 8 pre-built prompts covering architecture, SOLID principles, security, testing, and more
- **🎯 Custom Prompt Support**: Create and use your own custom analysis prompts from `.codeaudits/prompts` directory
- **💻 Local Development**: Run the tool locally outside of GitHub Actions for faster development cycles
- **⚡ Updated Dependencies**: Upgraded to Repomix v1.2.0 for improved parsing performance and reliability
- **📚 Enhanced Examples**: More comprehensive GitHub Actions configuration examples and use cases

## Overview

This action uses the [Repomix](https://github.com/yamadashy/repomix) library to generate a comprehensive text representation of your codebase and optionally submits it to Google Gemini with selected prompt. This allows you to:

- Create a single document containing your entire codebase in a readable format
- Analyze your code structure and organization
- Submit your code for AI auditing and analysis through Google Gemini

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
          compress: true             # Enable intelligent code parsing to reduce tokens (default: false)
          llm-prompt: architecture-refactoring  # Optional: AI analysis prompt
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
| `style` | Parsed document style. Use 'markdown', 'xml' or 'plain' (it's Repomix config option) | `markdown` | No |
| `compress` | Run intelligent code parsing to reduce tokens (it's Repomix config option) | `false` | No |
| `working-directory` | The directory in which to run the action. Defaults to the repository root | `.` | No |
| `llm-prompt` | The name of the prompt file for the Gemini prompt (see [Available Prompts](#available-prompts)) | | No |
| `llm-custom-prompt` | The name of the custom prompt file from `/.codeaudits/prompts` directory in your repository | | No |
| `gemini-api-key` | Gemini API key for AI-powered code analysis | | No |


## Available Prompts

When using the `llm-prompt` input, you can choose from the following predefined prompt files:

- `architecture-refactoring` - Analysis focused on architectural improvements and refactoring opportunities
- `dry-kiss-yagni` - Review based on DRY, KISS, and YAGNI principles
- `essential-software-patterns` - Analysis of software design patterns usage
- `functionalities-analysis` - Comprehensive functionality and feature analysis
- `missing-tests` - Identification of missing test coverage and testing opportunities
- `possible-bugs` - Detection of potential bugs and code issues
- `simplification-hints` - Suggestions for code simplification and optimization
- `solid` - Review based on SOLID principles

**Note:** If you provide an invalid prompt name, the action will fail with a helpful error message listing all available options.

## Custom Prompts

In addition to the predefined prompts, you can create and use custom prompts by:

1. Creating a `/.codeaudits/prompts` directory in your repository
2. Adding your custom prompt file (e.g., `my-custom-analysis.md`)
3. Using the `llm-custom-prompt` input with the filename

**Example custom prompt file structure:**
```
your-repository/
├── .codeaudits/
│   └── prompts/
│       ├── performance-analysis.md
│       ├── security-review.md
│       └── api-design-review.md
└── ... (your code)
```

**Usage with custom prompt:**
```yaml
- name: Run Custom AI Analysis
  uses: codeaudits/codeaudits-action@v1
  with:
    style: markdown
    llm-custom-prompt: performance-analysis.md  # or just: performance-analysis
    gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
```

**Important notes:**
- You cannot use both `llm-prompt` and `llm-custom-prompt` at the same time
- The `.md` extension is optional when specifying the filename
- Custom prompt files should contain markdown-formatted prompts for the AI analysis

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
    llm-prompt: architecture-refactoring
    gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
```

### AI-Powered Code Analysis with Custom Prompts

```yaml
- name: Run Custom AI Analysis
  uses: codeaudits/codeaudits-action@v1
  with:
    style: markdown
    compress: true
    llm-custom-prompt: security-review
    gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
```

**Setting up Gemini API Key:**
1. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add it as a repository secret named `GEMINI_API_KEY`
3. The AI analysis results will appear in the GitHub Actions job summary

## Example Workflows

You can find complete workflow examples in the `.github/workflows` directory:

- **[llm_audit.yml](.github/workflows/llm_audit.yml)** - Complete workflow with AI-powered audit using predefined prompts
- **[llm_audit_custom_prompt.yml](.github/workflows/llm_audit_custom_prompt.yml)** - AI audit using custom prompts from your repository
- **[llm_audit_external_codebase.yml](.github/workflows/llm_audit_external_codebase.yml)** - Audit external repositories with AI analysis
- **[llm_parse_only.yml](.github/workflows/llm_parse_only.yml)** - Parse repository without AI analysis (output only)
- **[llm_parse_only_external_codebase.yml](.github/workflows/llm_parse_only_external_codebase.yml)** - Parse external repositories without AI analysis

These examples demonstrate different use cases and can be copied directly to your repository's `.github/workflows` directory.

## Viewing Results

After the action completes:

1. The parsed repository will be available as a GitHub Actions artifact named `parsed-repo.txt`
2. Detailed metadata about the parsing process will be available in the job outputs

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
