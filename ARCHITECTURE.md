# Code Architecture Documentation

## Overview

This codebase has been refactored to follow clean architecture principles with clear separation of concerns, improved maintainability, and scalability.

## Dependencies

The project relies on the following key external libraries:
- **@actions/core**: GitHub Actions toolkit for core functionality
- **commander**: Command-line interface framework for local CLI usage
- **repomix**: Library for generating comprehensive text representations of codebases

## Structure

```
src/
├── interfaces/           # Type definitions and contracts
│   └── core.interface.ts # Core interface for GitHub Actions abstraction
├── core/                 # Core implementations
│   ├── github-actions-core.ts # GitHub Actions adapter
│   └── local-core.ts     # Local development implementation
├── services/             # Business logic services
│   └── repository-parser.service.ts # Repository parsing logic
├── app/                  # Application orchestration
│   └── codeaudits-parse.app.ts # Main application coordinator
├── main.ts              # Thin orchestration layer
├── index.ts             # Entry point and exports
├── local.ts             # CLI interface
```

## Key Components

### 1. Interfaces (`interfaces/`)
- **`ICoreInterface`**: Defines the contract for core functionality, enabling both GitHub Actions and local execution
- **`ISummary`**: Defines the summary reporting interface
- **`ActionOptions`**: Defines options for action execution (style, compress, output path, working directory)
- **`RepositoryParseOptions`**: Defines options specific to repository parsing
- **`ParseResult`**: Defines the structure of parsing results

### 2. Core Implementations (`core/`)
- **`GitHubActionsCore`**: Adapter that wraps GitHub Actions core to match our interface
- **`LocalCore`**: Mock implementation for local development and testing

### 3. Services (`services/`)
- **`RepositoryParser`**: Encapsulates all repository parsing logic
  - Handles repomix integration
  - Manages file operations
  - Extracts metadata
  - Generates summaries

### 4. Application Layer (`app/`)
- **`CodeAuditsParseApp`**: Main application orchestrator
  - Coordinates between services
  - Handles the main execution flow
  - Manages error handling

### 5. Entry Points
- **`main.ts`**: Thin orchestration layer with `run()` and `runLocal()` functions
- **`index.ts`**: GitHub Actions entry point + library exports (includes all public interfaces and classes)
- **`local.ts`**: CLI interface for local usage with Commander.js integration

## Benefits of This Architecture

### 1. **Separation of Concerns**
- Each class has a single responsibility
- Business logic is separated from infrastructure concerns
- Core abstractions allow for different execution environments

### 2. **Testability**
- Dependency injection through constructor parameters
- Interface-based design allows for easy mocking
- Services can be tested in isolation

### 3. **Maintainability**
- Clear boundaries between components
- Easy to locate and modify specific functionality
- Reduced coupling between modules

### 4. **Scalability**
- Easy to add new features without affecting existing code
- Plugin-like architecture for different core implementations
- Service layer can be extended with new parsers or processors

### 5. **Reusability**
- Components can be used independently
- Clear API through interfaces
- Easy to create different front-ends (CLI, web, etc.)

## Usage Examples

### GitHub Actions
```typescript
import { run } from './main.js'
await run() // Uses GitHub Actions core automatically
```

### Local Development
```typescript
import { runLocal } from './main.js'
await runLocal({
  style: 'plain',
  compress: false,
  workingDirectory: '.',
  outputFilePath: 'parsed-repo.txt'
})
```

### CLI Usage
```bash
# Basic usage
node dist/local.js

# With options
node dist/local.js --style markdown --compress --output my-repo.md --working-directory ./src

# Available CLI options:
# -s, --style <style>           Output style (default: "plain")
# -c, --compress               Enable compression (default: false)
# -w, --working-directory <dir> Working directory (default: ".")
# -o, --output <file>          Output file name (default: "parsed-repo.txt")
```

### Programmatic Usage
```typescript
import { CodeAuditsParseApp, LocalCore } from './index.js'

const core = new LocalCore(options)
const app = new CodeAuditsParseApp(core)
await app.execute()
```

### Available Exports
The library exports the following for programmatic use:
- **Functions**: `run`, `runLocal`
- **Classes**: `CodeAuditsParseApp`, `RepositoryParser`, `LocalCore`, `GitHubActionsCore`
- **Interfaces**: `ICoreInterface`, `ISummary`, `ActionOptions`, `RepositoryParseOptions`, `ParseResult`

## Migration Notes

The refactoring maintains backward compatibility:
- All existing entry points (`run`, `runLocal`) work the same way
- Same CLI interface in `local.ts` with Commander.js integration
- Same GitHub Actions integration
- Complete type safety with TypeScript interfaces

## Project Information

- **Name**: codeaudits-parse
- **Version**: 1.2.0
- **Repository**: frogermcs/codeaudits-parse

## Future Enhancements

This architecture makes it easy to add:
- Different output formats (new services)
- Additional submission targets (new submission services)
- Web interface (new core implementation)
- Batch processing capabilities
- Plugin system for custom parsers
- Enhanced CLI features and interactive modes
- Integration with other code analysis tools
