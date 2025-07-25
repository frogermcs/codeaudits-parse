# Local Usage

You can now run the codeaudits-parse tool locally without requiring GitHub Actions environment.

## Installation and Build

```bash
npm install
npm run build
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

## Development

For development with auto-reload:

```bash
npm run dev
```

This will watch for file changes and restart the application automatically.
