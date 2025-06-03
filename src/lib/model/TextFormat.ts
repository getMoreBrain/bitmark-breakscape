import { EnumType, superenum } from '@ncoderz/superenum';

const TextFormat = superenum({
  // plain text
  text: 'text',
  latex: 'latex', // LaTeX code, alias for text
  json: 'json', // json, alias for text
  xml: 'xml', // xml, alias for text

  // bitmarkText
  // bitmarkText in the body is bitmark++ and bitmarkText in a tag is bitmark+
  bitmarkPlusPlus: 'bitmark++',
});

export type TextFormatType = EnumType<typeof TextFormat>;

export { TextFormat };
