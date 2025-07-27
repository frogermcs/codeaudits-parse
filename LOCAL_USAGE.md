# Local Usage

You can now run the codeaudits-parse tool locally without requiring GitHub Actions environment.

## Installation and Build

```bash
npm install
npm run build
```

## Environment Setup

1. **Copy the environment file**:
```bash
cp .env.example .env
```

2. **Configure your environment variables**:
Edit the `.env` file and add your API keys:
```bash
# Gemini AI API Key - Get this from https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_actual_api_key_here
```

## Local Usage

After building, you can run the tool locally using:

```bash
npm run local -- [options]
```

### Available Options

- `-s, --style <style>`: Output style (default: 'plain')
- `-c, --compress`: Enable compression
- `-w, --working-directory <dir>`: Working directory (default: '.')
- `-o, --output <file>`: Output file name (default: 'parsed-repo.txt')
- `-i, --instruction <name>`: Name of the instruction file for Gemini prompt

### Examples

1. **Basic usage** - Parse current directory:
```bash
npm run local
```

2. **Parse with specific style and compression**:
```bash
npm run local -- --style xml --compress
```

3. **Parse specific directory with custom output**:
```bash
npm run local -- --working-directory ./src --output my-repo.txt
```

4. **Use with Gemini API (reads from .env file)**:
```bash
npm run local -- --style markdown --instruction architecture
```

## Development

For development with auto-reload:

```bash
npm run dev
```

This will watch for file changes and restart the application automatically.
