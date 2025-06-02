# Development Guide

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Build the project: `npm run build`

## Development Workflow

### Making Changes

1. Create a new branch for your feature: `git checkout -b feature/your-feature-name`
2. Make your changes in the `src/` directory
3. Add tests for your changes in `src/__tests__/`
4. Run the development commands to ensure everything works:
   ```bash
   npm run typecheck  # Check for TypeScript errors
   npm run lint       # Check for linting issues
   npm run test:ci    # Run tests
   npm run build      # Build the project
   ```

### Code Style

- We use ESLint for code linting
- We use Prettier for code formatting
- TypeScript strict mode is enabled
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Testing

- Write unit tests for all new functionality
- Tests are located in `src/__tests__/`
- We use Vitest as the testing framework
- Aim for high test coverage

### Building

The project uses `tsup` to build both CommonJS and ESM versions:

- CommonJS output: `dist/index.js`
- ESM output: `dist/index.mjs`
- TypeScript declarations: `dist/index.d.ts`

### Publishing

1. Update the version in `package.json`
2. Update `CHANGELOG.md` with your changes
3. Run `npm run prepublishOnly` to ensure everything passes
4. Create a pull request
5. After merge to main, the package will be automatically published via GitHub Actions

## Project Structure

```
src/
├── lib/           # Main library code
│   └── index.ts   # Main exports
├── __tests__/     # Test files
│   └── index.test.ts
└── index.ts       # Entry point

dist/              # Built files (generated)
├── index.js       # CommonJS build
├── index.mjs      # ESM build
└── index.d.ts     # TypeScript declarations
```

## Available Scripts

- `npm run build` - Build the project
- `npm run dev` - Build and watch for changes
- `npm test` - Run tests in watch mode
- `npm run test:ci` - Run tests once
- `npm run lint` - Lint the code
- `npm run lint:fix` - Lint and fix issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run typecheck` - Run TypeScript type checking
- `npm run clean` - Clean build artifacts
