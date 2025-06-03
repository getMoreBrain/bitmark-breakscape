/**
 *  Run with:  npx vitest run
 */

import { describe, it, expect } from 'vitest';

import { Breakscape } from '../lib/breakscape.ts'; // adjust if needed
import { TextFormat, TextFormatType } from '../lib/model/TextFormat.ts'; // adjust if needed
import { TextLocation, TextLocationType } from '../lib/model/TextLocation.ts'; // adjust if needed

type Case = {
  from: string;
  to: {
    bitmarkText_body: string;
    bitmarkText_tag: string;
    plainText_body: string;
    plainText_tag: string;
  };
};

// ---------------------------------------------------------------------------
// 1.  Spec rows   (verbatim from comment table)
// ---------------------------------------------------------------------------
const CASES: Case[] = [
  // ───── HATS ─────
  {
    from: '^',
    to: {
      bitmarkText_body: '^^',
      bitmarkText_tag: '^^',
      plainText_body: '^',
      plainText_tag: '^^',
    },
  },
  {
    from: '^^',
    to: {
      bitmarkText_body: '^^^',
      bitmarkText_tag: '^^^',
      plainText_body: '^^',
      plainText_tag: '^^^',
    },
  },
  {
    from: '^^^^',
    to: {
      bitmarkText_body: '^^^^^',
      bitmarkText_tag: '^^^^^',
      plainText_body: '^^^^',
      plainText_tag: '^^^^^',
    },
  },
  {
    from: '*^*^*',
    to: {
      bitmarkText_body: '*^^*^^*',
      bitmarkText_tag: '*^^*^^*',
      plainText_body: '*^*^*',
      plainText_tag: '*^^*^^*',
    },
  },
  {
    from: '|^|^|',
    to: {
      bitmarkText_body: '|^^|^^|',
      bitmarkText_tag: '|^^|^^|',
      plainText_body: '|^|^|',
      plainText_tag: '|^^|^^|',
    },
  },
  {
    from: '_^_^_',
    to: {
      bitmarkText_body: '_^^_^^_',
      bitmarkText_tag: '_^^_^^_',
      plainText_body: '_^_^_',
      plainText_tag: '_^^_^^_',
    },
  },

  // ───── INLINE DOUBLES (body) ─────
  {
    from: '==',
    to: {
      bitmarkText_body: '=^=',
      bitmarkText_tag: '=^=',
      plainText_body: '==',
      plainText_tag: '==',
    },
  },
  {
    from: 'before==after',
    to: {
      bitmarkText_body: 'before=^=after',
      bitmarkText_tag: 'before=^=after',
      plainText_body: 'before==after',
      plainText_tag: 'before==after',
    },
  },
  {
    from: '===',
    to: {
      bitmarkText_body: '=^=^=',
      bitmarkText_tag: '=^=^=',
      plainText_body: '===',
      plainText_tag: '===',
    },
  },
  {
    from: '====',
    to: {
      bitmarkText_body: '=^=^=^=',
      bitmarkText_tag: '=^=^=^=',
      plainText_body: '====',
      plainText_tag: '====',
    },
  },
  {
    from: '**',
    to: {
      bitmarkText_body: '*^*',
      bitmarkText_tag: '*^*',
      plainText_body: '**',
      plainText_tag: '**',
    },
  },
  {
    from: '***',
    to: {
      bitmarkText_body: '*^*^*',
      bitmarkText_tag: '*^*^*',
      plainText_body: '***',
      plainText_tag: '***',
    },
  },
  {
    from: '****',
    to: {
      bitmarkText_body: '*^*^*^*',
      bitmarkText_tag: '*^*^*^*',
      plainText_body: '****',
      plainText_tag: '****',
    },
  },
  {
    from: 'before**after',
    to: {
      bitmarkText_body: 'before*^*after',
      bitmarkText_tag: 'before*^*after',
      plainText_body: 'before**after',
      plainText_tag: 'before**after',
    },
  },
  {
    from: '``',
    to: {
      bitmarkText_body: '`^`',
      bitmarkText_tag: '`^`',
      plainText_body: '``',
      plainText_tag: '``',
    },
  },
  {
    from: '```',
    to: {
      bitmarkText_body: '`^`^`',
      bitmarkText_tag: '`^`^`',
      plainText_body: '```',
      plainText_tag: '```',
    },
  },
  {
    from: '````',
    to: {
      bitmarkText_body: '`^`^`^`',
      bitmarkText_tag: '`^`^`^`',
      plainText_body: '````',
      plainText_tag: '````',
    },
  },
  {
    from: 'before``after',
    to: {
      bitmarkText_body: 'before`^`after',
      bitmarkText_tag: 'before`^`after',
      plainText_body: 'before``after',
      plainText_tag: 'before``after',
    },
  },
  {
    from: '__',
    to: {
      bitmarkText_body: '_^_',
      bitmarkText_tag: '_^_',
      plainText_body: '__',
      plainText_tag: '__',
    },
  },
  {
    from: '___',
    to: {
      bitmarkText_body: '_^_^_',
      bitmarkText_tag: '_^_^_',
      plainText_body: '___',
      plainText_tag: '___',
    },
  },
  {
    from: '____',
    to: {
      bitmarkText_body: '_^_^_^_',
      bitmarkText_tag: '_^_^_^_',
      plainText_body: '____',
      plainText_tag: '____',
    },
  },
  {
    from: 'before__after',
    to: {
      bitmarkText_body: 'before_^_after',
      bitmarkText_tag: 'before_^_after',
      plainText_body: 'before__after',
      plainText_tag: 'before__after',
    },
  },
  {
    from: '!!',
    to: {
      bitmarkText_body: '!^!',
      bitmarkText_tag: '!^!',
      plainText_body: '!!',
      plainText_tag: '!!',
    },
  },
  {
    from: '!!!',
    to: {
      bitmarkText_body: '!^!^!',
      bitmarkText_tag: '!^!^!',
      plainText_body: '!!!',
      plainText_tag: '!!!',
    },
  },
  {
    from: '!!!!',
    to: {
      bitmarkText_body: '!^!^!^!',
      bitmarkText_tag: '!^!^!^!',
      plainText_body: '!!!!',
      plainText_tag: '!!!!',
    },
  },
  {
    from: 'before!!after',
    to: {
      bitmarkText_body: 'before!^!after',
      bitmarkText_tag: 'before!^!after',
      plainText_body: 'before!!after',
      plainText_tag: 'before!!after',
    },
  },

  // ───── BLOCK / LIST  (at SOL) ─────
  {
    from: '### ',
    to: {
      bitmarkText_body: '###^ ',
      bitmarkText_tag: '### ',
      plainText_body: '### ',
      plainText_tag: '### ',
    },
  },
  {
    from: '|',
    to: {
      bitmarkText_body: '|^',
      bitmarkText_tag: '|',
      plainText_body: '|',
      plainText_tag: '|',
    },
  },
  {
    from: '|code',
    to: {
      bitmarkText_body: '|^code',
      bitmarkText_tag: '|code',
      plainText_body: '|code',
      plainText_tag: '|code',
    },
  },
  {
    from: '|image:http',
    to: {
      bitmarkText_body: '|^image:http',
      bitmarkText_tag: '|image:http',
      plainText_body: '|image:http',
      plainText_tag: '|image:http',
    },
  },
  {
    from: '• ',
    to: {
      bitmarkText_body: '•^ ',
      bitmarkText_tag: '• ',
      plainText_body: '• ',
      plainText_tag: '• ',
    },
  },
  {
    from: '•_ ',
    to: {
      bitmarkText_body: '•^_ ',
      bitmarkText_tag: '•_ ',
      plainText_body: '•_ ',
      plainText_tag: '•_ ',
    },
  },
  {
    from: '•12 ',
    to: {
      bitmarkText_body: '•^12 ',
      bitmarkText_tag: '•12 ',
      plainText_body: '•12 ',
      plainText_tag: '•12 ',
    },
  },
  {
    from: '•12i ',
    to: {
      bitmarkText_body: '•^12i ',
      bitmarkText_tag: '•12i ',
      plainText_body: '•12i ',
      plainText_tag: '•12i ',
    },
  },
  {
    from: '•12I ',
    to: {
      bitmarkText_body: '•^12I ',
      bitmarkText_tag: '•12I ',
      plainText_body: '•12I ',
      plainText_tag: '•12I ',
    },
  },
  {
    from: '•a ',
    to: {
      bitmarkText_body: '•^a ',
      bitmarkText_tag: '•a ',
      plainText_body: '•a ',
      plainText_tag: '•a ',
    },
  },
  {
    from: '•+ ',
    to: {
      bitmarkText_body: '•^+ ',
      bitmarkText_tag: '•+ ',
      plainText_body: '•+ ',
      plainText_tag: '•+ ',
    },
  },
  {
    from: '•- ',
    to: {
      bitmarkText_body: '•^- ',
      bitmarkText_tag: '•- ',
      plainText_body: '•- ',
      plainText_tag: '•- ',
    },
  },

  // ───── LIST  (with space) ─────
  {
    from: ' • ',
    to: {
      bitmarkText_body: ' • ',
      bitmarkText_tag: ' • ',
      plainText_body: ' • ',
      plainText_tag: ' • ',
    },
  },
  {
    from: ' •_ ',
    to: {
      bitmarkText_body: ' •_ ',
      bitmarkText_tag: ' •_ ',
      plainText_body: ' •_ ',
      plainText_tag: ' •_ ',
    },
  },
  {
    from: ' •12 ',
    to: {
      bitmarkText_body: ' •12 ',
      bitmarkText_tag: ' •12 ',
      plainText_body: ' •12 ',
      plainText_tag: ' •12 ',
    },
  },
  {
    from: ' •12i ',
    to: {
      bitmarkText_body: ' •12i ',
      bitmarkText_tag: ' •12i ',
      plainText_body: ' •12i ',
      plainText_tag: ' •12i ',
    },
  },
  {
    from: ' •12I ',
    to: {
      bitmarkText_body: ' •12I ',
      bitmarkText_tag: ' •12I ',
      plainText_body: ' •12I ',
      plainText_tag: ' •12I ',
    },
  },
  {
    from: ' •a ',
    to: {
      bitmarkText_body: ' •a ',
      bitmarkText_tag: ' •a ',
      plainText_body: ' •a ',
      plainText_tag: ' •a ',
    },
  },
  {
    from: ' •+ ',
    to: {
      bitmarkText_body: ' •+ ',
      bitmarkText_tag: ' •+ ',
      plainText_body: ' •+ ',
      plainText_tag: ' •+ ',
    },
  },
  {
    from: ' •- ',
    to: {
      bitmarkText_body: ' •- ',
      bitmarkText_tag: ' •- ',
      plainText_body: ' •- ',
      plainText_tag: ' •- ',
    },
  },

  // ───── START-OF-TAG inside body ([@ etc.) ─────
  {
    from: '[.',
    to: {
      bitmarkText_body: '[^.',
      bitmarkText_tag: '[.',
      plainText_body: '[^.',
      plainText_tag: '[.',
    },
  },
  {
    from: ' [.',
    to: {
      bitmarkText_body: ' [^.',
      bitmarkText_tag: ' [.',
      plainText_body: ' [.',
      plainText_tag: ' [.',
    },
  },
  {
    from: '[@',
    to: {
      bitmarkText_body: '[^@',
      bitmarkText_tag: '[@',
      plainText_body: '[@',
      plainText_tag: '[@',
    },
  },
  {
    from: ' [@',
    to: {
      bitmarkText_body: ' [^@',
      bitmarkText_tag: ' [@',
      plainText_body: ' [@',
      plainText_tag: ' [@',
    },
  },
  {
    from: '[#',
    to: {
      bitmarkText_body: '[^#',
      bitmarkText_tag: '[#',
      plainText_body: '[#',
      plainText_tag: '[#',
    },
  },
  {
    from: ' [#',
    to: {
      bitmarkText_body: ' [^#',
      bitmarkText_tag: ' [#',
      plainText_body: ' [#',
      plainText_tag: ' [#',
    },
  },
  {
    from: '[▼',
    to: {
      bitmarkText_body: '[^▼',
      bitmarkText_tag: '[▼',
      plainText_body: '[▼',
      plainText_tag: '[▼',
    },
  },
  {
    from: ' [▼',
    to: {
      bitmarkText_body: ' [^▼',
      bitmarkText_tag: ' [▼',
      plainText_body: ' [▼',
      plainText_tag: ' [▼',
    },
  },
  {
    from: '[►',
    to: {
      bitmarkText_body: '[^►',
      bitmarkText_tag: '[►',
      plainText_body: '[►',
      plainText_tag: '[►',
    },
  },
  {
    from: ' [►',
    to: {
      bitmarkText_body: ' [^►',
      bitmarkText_tag: ' [►',
      plainText_body: ' [►',
      plainText_tag: ' [►',
    },
  },
  {
    from: '[%',
    to: {
      bitmarkText_body: '[^%',
      bitmarkText_tag: '[%',
      plainText_body: '[%',
      plainText_tag: '[%',
    },
  },
  {
    from: ' [%',
    to: {
      bitmarkText_body: ' [^%',
      bitmarkText_tag: ' [%',
      plainText_body: ' [%',
      plainText_tag: ' [%',
    },
  },
  {
    from: '[!',
    to: {
      bitmarkText_body: '[^!',
      bitmarkText_tag: '[!',
      plainText_body: '[!',
      plainText_tag: '[!',
    },
  },
  {
    from: ' [!',
    to: {
      bitmarkText_body: ' [^!',
      bitmarkText_tag: ' [!',
      plainText_body: ' [!',
      plainText_tag: ' [!',
    },
  },
  {
    from: '[?',
    to: {
      bitmarkText_body: '[^?',
      bitmarkText_tag: '[?',
      plainText_body: '[?',
      plainText_tag: '[?',
    },
  },
  {
    from: ' [?',
    to: {
      bitmarkText_body: ' [^?',
      bitmarkText_tag: ' [?',
      plainText_body: ' [?',
      plainText_tag: ' [?',
    },
  },
  {
    from: '[+',
    to: {
      bitmarkText_body: '[^+',
      bitmarkText_tag: '[+',
      plainText_body: '[+',
      plainText_tag: '[+',
    },
  },
  {
    from: ' [+',
    to: {
      bitmarkText_body: ' [^+',
      bitmarkText_tag: ' [+',
      plainText_body: ' [+',
      plainText_tag: ' [+',
    },
  },
  {
    from: ' [-',
    to: {
      bitmarkText_body: ' [^-',
      bitmarkText_tag: ' [-',
      plainText_body: ' [-',
      plainText_tag: ' [-',
    },
  },
  {
    from: ' [-',
    to: {
      bitmarkText_body: ' [^-',
      bitmarkText_tag: ' [-',
      plainText_body: ' [-',
      plainText_tag: ' [-',
    },
  },
  {
    from: '[$',
    to: {
      bitmarkText_body: '[^$',
      bitmarkText_tag: '[$',
      plainText_body: '[$',
      plainText_tag: '[$',
    },
  },
  {
    from: ' [$',
    to: {
      bitmarkText_body: ' [^$',
      bitmarkText_tag: ' [$',
      plainText_body: ' [$',
      plainText_tag: ' [$',
    },
  },
  {
    from: '[_',
    to: {
      bitmarkText_body: '[^_',
      bitmarkText_tag: '[_',
      plainText_body: '[_',
      plainText_tag: '[_',
    },
  },
  {
    from: ' [_',
    to: {
      bitmarkText_body: ' [^_',
      bitmarkText_tag: ' [_',
      plainText_body: ' [_',
      plainText_tag: ' [_',
    },
  },
  {
    from: '[=',
    to: {
      bitmarkText_body: '[^=',
      bitmarkText_tag: '[=',
      plainText_body: '[=',
      plainText_tag: '[=',
    },
  },
  {
    from: ' [=',
    to: {
      bitmarkText_body: ' [^=',
      bitmarkText_tag: ' [=',
      plainText_body: ' [=',
      plainText_tag: ' [=',
    },
  },
  {
    from: '[&',
    to: {
      bitmarkText_body: '[^&',
      bitmarkText_tag: '[&',
      plainText_body: '[&',
      plainText_tag: '[&',
    },
  },
  {
    from: ' [&',
    to: {
      bitmarkText_body: ' [^&',
      bitmarkText_tag: ' [&',
      plainText_body: ' [&',
      plainText_tag: ' [&',
    },
  },

  // ───── end-of-tag  ] ─────
  {
    from: ']',
    to: {
      bitmarkText_body: ']',
      bitmarkText_tag: '^]',
      plainText_body: ']',
      plainText_tag: '^]',
    },
  },
  {
    from: ' ]',
    to: {
      bitmarkText_body: ' ]',
      bitmarkText_tag: ' ^]',
      plainText_body: ' ]',
      plainText_tag: ' ^]',
    },
  },

  // ───── complex ─────
  {
    from: ':5__5:32]**fg^[.article]e!!--``test]^',
    to: {
      bitmarkText_body: ':5_^_5:32]*^*fg^^[^.article]e!^!--`^`test]^^',
      bitmarkText_tag: ':5_^_5:32^]*^*fg^^[.article^]e!^!--`^`test^]^^',
      plainText_body: ':5__5:32]**fg^[.article]e!!--``test]^',
      plainText_tag: ':5__5:32^]**fg^^[.article^]e!!--``test^]^^',
    },
  },
  {
    from: '^]^[.article]^^]^',
    to: {
      bitmarkText_body: '^^]^^[^.article]^^^]^^',
      bitmarkText_tag: '^^]^^[.article^]^^^]^^',
      plainText_body: '^]^[.article]^^]^',
      plainText_tag: '^^]^^[.article^]^^^]^^',
    },
  },
];

// ---------------------------------------------------------------------------
// 2.  Parametrised Vitest tests
// ---------------------------------------------------------------------------
describe(`Breakscape`, () => {
  const bs = new Breakscape();

  const types: string[] = [
    'bitmarkText_body',
    'bitmarkText_tag',
    'plainText_body',
    'plainText_tag',
  ];

  types.forEach((type: string) => {
    const textFormat = TextFormat.fromKey(type.split('_')[0]) as TextFormatType;
    const textLocation = TextLocation.fromKey(
      type.split('_')[1]
    ) as TextLocationType;

    // Standard tests
    describe(`[${textFormat}, ${textLocation}]`, () => {
      CASES.forEach(({ from, to: _to }) => {
        const to = _to[type];

        it(`${from} → breakscape → ${to}`, () => {
          const res = bs.breakscape(from, {
            textFormat,
            textLocation,
          });
          expect(res).toBe(to);
        });
        it(`${to} → unbreakscape → ${from}`, () => {
          const res = bs.unbreakscape(to, {
            textFormat,
            textLocation,
          });
          expect(res).toBe(from);
        });
      });
    });
  });

  // Array tests
  // const textFormat = TextFormat.bitmarkText;
  // const textLocation = TextLocation.body;
  // const from = ['^'];
  // const to = ['^^'];

  // describe(`[${textFormat}, ${textLocation}] (array)`, () => {
  //   it(`[${textFormat}, ${textLocation}] ${from} → breakscape → ${to}`, () => {
  //     const res = bs.breakscape(from, {
  //       textFormat,
  //       textLocation,
  //     });
  //     expect(res).toBe(to);
  //   });
  //   it(`${to} → unbreakscape → ${from}`, () => {
  //     const res = bs.unbreakscape(to, {
  //       textFormat,
  //       textLocation,
  //     });
  //     expect(res).toBe(from);
  //   });
  // });
});
