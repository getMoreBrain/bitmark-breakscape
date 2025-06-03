# @gmb/bitmark-breakscape

Breakscaping for bitmark text.

## Why Bitmark Breakscape

The [Bitmark Parser Generator](https://github.com/getMoreBrain/bitmark-parser-generator) is used
to parse and generate bitmark markup. When it is being used directly, there is no need to use
this library, as breakscaping will happen automatically.

However, if you are manually building bitmark markup with code, then this is the library for
you. Use it to breakscape the bitmark text before adding it to the bitmark.


## Installation

```bash
npm install @gmb/bitmark-breakscape
```

## Usage

```typescript
import { Breakscape, TextFormat, TextLocation } from '@gmb/bitmark-breakscape';

//
// Example usage
//

/* Default usage (for text to be inserted in the body of a bit) */

const res = Breakscape.breakscape('This is about an [.article]');
// res = 'This is about an [^.article]'

/* With options usage (for text to be inserted in a tag and / or plain text) */
/* In this case, plain text destined for a tag like [! instruction ] */

const res = Breakscape.breakscape('This is about an [.article]', {
  format: TextFormat.text,
  location: TextLocation.tag
});
// res = 'This is about an [.article^]'

/* The input can be an array of texts to process */
/* In this case, inPlaceArray can be used to modify the array in place, or return a new array,
/* the default is to return a new array */

const res = Breakscape.breakscape(['This is about an [.article]', 'Not __italic__ text'], {
  inPlaceArray: true
});
// res = ['This is about an [^.article]', 'Not _^_italic_^_ text']


```

### ESM / CommonJS

This project is true ESM module, however, it is backwards compatible with CommonJS.

If a project depends on this library and that project is still using CommonJS for modules, use
the following code to import the library:

#### TypeScript
```typescript
import type * as BreakscapeModuleType from '@gmb/bitmark-breakscape';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const BreakscapeModule = require('@gmb/bitmark-breakscape') as typeof BreakscapeModuleType;
```

#### JavaScript
```javascript
const BreakscapeModule = require('@gmb/bitmark-breakscape');
```

## Development

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run in development mode with watch
npm run dev
```

### Scripts

- `npm run build` - Build the project for production
- `npm run dev` - Build and watch for changes
- `npm test` - Run tests
- `npm run test:ci` - Run tests in CI mode
- `npm run lint` - Lint the code
- `npm run lint:fix` - Lint and fix issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run typecheck` - Run TypeScript type checking

## Which version should I use?

This project version follows the version of the
[Bitmark Parser Generator](https://github.com/getMoreBrain/bitmark-parser-generator)

You should use the version that matches or is closest behind the version of the
Bitmark Parser Generator that you are using.

For example, imagine the following Breakscape versions exist:
- v2.1.3
- v2.2.0
- v2.2.10

Then the following Breakscape versions should be used:
- Bitmark Parser Generator v2.1.3 ==> Breakscape v2.1.3
- Bitmark Parser Generator v2.2.9 ==> Breakscape v2.2.0

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Author

Get More Brain Ltd
