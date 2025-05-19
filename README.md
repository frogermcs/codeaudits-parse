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
          push-to-codeaudits: true   # Submit to CodeAudits.ai
          codeaudits-api-key: ${{ secrets.CODEAUDITS_API_KEY }}  # Optional: For private accounts
      
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
| `push-to-codeaudits` | Whether to upload parsed repo to CodeAudits.ai | `true` | No |
| `codeaudits-base-path` | Base URL for the CodeAudits API | `https://codeaudits.ai/` | No |
| `codeaudits-api-key` | CodeAudits API key for assignment to your private account | - | No |

## Outputs

| Output | Description |
|--------|-------------|
| `parse-metadata` | Metadata of the parsed repository |
| `parsed-file-name` | Name of the parsed output file |
| `submission-status` | Result of the submission to CodeAudits |

## Examples

### Basic Analysis

```yaml
- name: Run CodeAudits Analysis
  uses: codeaudits/codeaudits-action@v1
  with:
    style: markdown
    push-to-codeaudits: true
```

### Parse Only (without submission)

```yaml
- name: Parse Repository Without Submitting
  uses: codeaudits/codeaudits-action@v1
  with:
    style: markdown
    push-to-codeaudits: false
```

### With Custom API Key

```yaml
- name: Run CodeAudits Analysis with API Key
  uses: codeaudits/codeaudits-action@v1
  with:
    style: markdown
    push-to-codeaudits: true
    codeaudits-api-key: ${{ secrets.CODEAUDITS_API_KEY }}
```

## Viewing Results

After the action completes:

1. The parsed repository will be available as a GitHub Actions artifact named `parsed-repo.txt`
2. If submission to CodeAudits was enabled, a link to the analysis will be provided in the workflow run summary
3. Detailed metadata about the parsing process will be available in the job outputs

## Privacy and Security

When using this action with `push-to-codeaudits: true`, your code will be sent to CodeAudits.ai for analysis. If you have concerns about sensitive code, you can:

- Use `push-to-codeaudits: false` to only generate the parsed file without submitting it
- Create a `.repomixignore` file to exclude sensitive files from parsing
- Use a private instance of CodeAudits with the `codeaudits-base-path` option

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
