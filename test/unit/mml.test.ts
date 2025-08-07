import { test } from 'node:test';
import { deepStrictEqual, strictEqual } from 'assert';
import { getMathVariant, mmlToTex, segmentMathVariants } from '../../src/mml';
import { mathEl, setupDom } from './test-utils';

setupDom();

test('getMathVariant basic Latin and variants', () => {
  deepStrictEqual(getMathVariant('A'), { variant: 'normal', ascii: 'A' });
  deepStrictEqual(getMathVariant('a'), { variant: 'normal', ascii: 'a' });
  deepStrictEqual(getMathVariant('0'), { variant: 'normal', ascii: '0' });
  deepStrictEqual(getMathVariant('𝓐'), { variant: 'bold-script', ascii: 'A' });
  deepStrictEqual(getMathVariant('𝒶'), { variant: 'script', ascii: 'a' });
  deepStrictEqual(getMathVariant('𝐀'), { variant: 'bold', ascii: 'A' });
  deepStrictEqual(getMathVariant('𝐚'), { variant: 'bold', ascii: 'a' });
  deepStrictEqual(getMathVariant('𝔄'), { variant: 'fraktur', ascii: 'A' });
  deepStrictEqual(getMathVariant('𝔞'), { variant: 'fraktur', ascii: 'a' });
  deepStrictEqual(getMathVariant('𝑨'), { variant: 'bold-italic', ascii: 'A' });
  deepStrictEqual(getMathVariant('𝙰'), { variant: 'monospace', ascii: 'A' });
  deepStrictEqual(getMathVariant('𝟘'), { variant: 'double-struck', ascii: '0' });
  deepStrictEqual(getMathVariant('𝔇'), { variant: 'fraktur', ascii: 'D' });
  deepStrictEqual(getMathVariant('Α'), { variant: 'normal', ascii: 'Α' });
  deepStrictEqual(getMathVariant('α'), { variant: 'normal', ascii: 'α' });
  deepStrictEqual(getMathVariant('Д'), { variant: null, ascii: 'Д' });
  deepStrictEqual(getMathVariant('❤'), { variant: null, ascii: '❤' });
});

test('segmentMathVariants alphabet strings', () => {
  const alphabets = [
    { input: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzıȷ', expected: [['normal', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzıȷ']] },
    { input: '𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳', expected: [['bold', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz']] },
    { input: '𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧𝚤𝚥', expected: [['italic', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzıȷ']] },
    { input: '𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛', expected: [['bold-italic', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz']] },
    { input: '𝖠𝖡𝖢𝖣𝖤𝖥𝖦𝖧𝖨𝖩𝖪𝖫𝖬𝖭𝖮𝖯𝖰𝖱𝖲𝖳𝖴𝖵𝖶𝖷𝖸𝖹𝖺𝖻𝖼𝖽𝖾𝖿𝗀𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓', expected: [['sans-serif', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz']] },
    { input: '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇', expected: [['bold-sans-serif', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz']] },
    { input: '𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻', expected: [['sans-serif-italic', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz']] },
    { input: '𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯', expected: [['sans-serif-bold-italic', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz']] },
    { input: '𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏', expected: [['script', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz']] },
    { input: '𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃', expected: [['bold-script', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz']] },
    { input: '𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷', expected: [['fraktur', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz']] },
    { input: '𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟', expected: [['bold-fraktur', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz']] },
    { input: '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣', expected: [['monospace', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz']] },
    { input: '𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫', expected: [['double-struck', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz']] },
    // Greek
    { input: 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡϴΣΤΥΦΧΨΩ∇Ϝαβγδεζηθικλμνξοπρςστυφχψω∂ϵϑϰϕϱϖϝ', expected: [['normal', 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡϴΣΤΥΦΧΨΩ∇Ϝαβγδεζηθικλμνξοπρςστυφχψω∂ϵϑϰϕϱϖϝ']] },
    { input: '𝚨𝚩𝚪𝚫𝚬𝚭𝚮𝚯𝚰𝚱𝚲𝚳𝚴𝚵𝚶𝚷𝚸𝚹𝚺𝚻𝚼𝚽𝚾𝚿𝛀𝛁𝛂𝛃𝛄𝛅𝛆𝛇𝛈𝛉𝛊𝛋𝛌𝛍𝛎𝛏𝛐𝛑𝛒𝛓𝛔𝛕𝛖𝛗𝛘𝛙𝛚𝛛𝛜𝛝𝛞𝛟𝛠𝛡', expected: [['bold', 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡϴΣΤΥΦΧΨΩ∇αβγδεζηθικλμνξοπρςστυφχψω∂ϵϑϰϕϱϖ']] },
    { input: '𝛢𝛣𝛤𝛥𝛦𝛧𝛨𝛩𝛪𝛫𝛬𝛭𝛮𝛯𝛰𝛱𝛲𝛳𝛴𝛵𝛶𝛷𝛸𝛹𝛺𝛻𝛼𝛽𝛾𝛿𝜀𝜁𝜂𝜃𝜄𝜅𝜆𝜇𝜈𝜉𝜊𝜋𝜌𝜍𝜎𝜏𝜐𝜑𝜒𝜓𝜔𝜕𝜖𝜗𝜘𝜙𝜚𝜛', expected: [['italic', 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡϴΣΤΥΦΧΨΩ∇αβγδεζηθικλμνξοπρςστυφχψω∂ϵϑϰϕϱϖ']] },
    { input: '𝜜𝜝𝜞𝜟𝜠𝜡𝜢𝜣𝜤𝜥𝜦𝜧𝜨𝜩𝜪𝜫𝜬𝜭𝜮𝜯𝜰𝜱𝜲𝜳𝜴𝜵𝜶𝜷𝜸𝜹𝜺𝜻𝜼𝜽𝜾𝜿𝝀𝝁𝝂𝝃𝝄𝝅𝝆𝝇𝝈𝝉𝝊𝝋𝝌𝝍𝝎𝝏𝝐𝝑𝝒𝝓𝝔𝝕', expected: [['bold-italic', 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡϴΣΤΥΦΧΨΩ∇αβγδεζηθικλμνξοπρςστυφχψω∂ϵϑϰϕϱϖ']] },
    { input: '𝝖𝝗𝝘𝝙𝝚𝝛𝝜𝝝𝝞𝝟𝝠𝝡𝝢𝝣𝝤𝝥𝝦𝝧𝝨𝝩𝝪𝝫𝝬𝝭𝝮𝝯𝝰𝝱𝝲𝝳𝝴𝝵𝝶𝝷𝝸𝝹𝝺𝝻𝝼𝝽𝝾𝝿𝞀𝞁𝞂𝞃𝞄𝞅𝞆𝞇𝞈𝞉𝞊𝞋𝞌𝞍𝞎𝞏', expected: [['bold-sans-serif', 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡϴΣΤΥΦΧΨΩ∇αβγδεζηθικλμνξοπρςστυφχψω∂ϵϑϰϕϱϖ']] },
    { input: '𝞐𝞑𝞒𝞓𝞔𝞕𝞖𝞗𝞘𝞙𝞚𝞛𝞜𝞝𝞞𝞟𝞠𝞡𝞢𝞣𝞤𝞥𝞦𝞧𝞨𝞩𝞪𝞫𝞬𝞭𝞮𝞯𝞰𝞱𝞲𝞳𝞴𝞵𝞶𝞷𝞸𝞹𝞺𝞻𝞼𝞽𝞾𝞿𝟀𝟁𝟂𝟃𝟄𝟅𝟆𝟇𝟈𝟉', expected: [['sans-serif-bold-italic', 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡϴΣΤΥΦΧΨΩ∇αβγδεζηθικλμνξοπρςστυφχψω∂ϵϑϰϕϱϖ']] },
    // Digits
    { input: '0123456789', expected: [['normal', '0123456789']] },
    { input: '𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗', expected: [['bold', '0123456789']] },
    { input: '𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡', expected: [['double-struck', '0123456789']] },
    { input: '𝟢𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫', expected: [['sans-serif', '0123456789']] },
    { input: '𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵', expected: [['bold-sans-serif', '0123456789']] },
    { input: '𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿', expected: [['monospace', '0123456789']] },
  ];

  for (const { input, expected } of alphabets) {
    const result = segmentMathVariants(input);
    deepStrictEqual(result.map(r => [r.variant, r.str]), expected);
  }
});

test('segmentMathVariants mixed Unicode', () => {
  const text = 'hello 𝐬𝐭𝐫𝐚𝐧𝐠𝐞 𝔫𝔢𝔴 wonderful world';
  const expected = [
    { variant: 'normal', str: 'hello ' },
    { variant: 'bold', str: 'strange ' },
    { variant: 'fraktur', str: 'new ' },
    { variant: 'normal', str: 'wonderful world' },
  ];
  const result = segmentMathVariants(text);

  deepStrictEqual(result, expected);
});

test('segmentMathVariants groups non-math Unicode as normal', () => {
  const text = '新年快乐 hello 𝓦𝓸𝓻𝓵𝓭 123 😊!';
  const expected = [
    { variant: 'normal', str: '新年快乐 hello ' },
    { variant: 'bold-script', str: 'World ' },
    { variant: 'normal', str: '123 😊!' },
  ];

  const result = segmentMathVariants(text);
  deepStrictEqual(result, expected);
});

test('segmentMathVariants with neutral run at start', () => {
  const text = 'こんにちは 𝐀𝐁𝐂';
  const expected = [
    { variant: 'bold', str: 'こんにちは ABC' },
  ];
  const result = segmentMathVariants(text);
  deepStrictEqual(result, expected);
});

test('segmentMathVariants with neutral sandwich', () => {
  const text = '🙂𝑭𝑶𝑶🙃';
  const expected = [
    { variant: 'bold-italic', str: '🙂FOO🙃' },
  ];
  const result = segmentMathVariants(text);
  deepStrictEqual(result, expected);
});

test('mmlToText: <mi> basic', () => {
  strictEqual(mmlToTex(mathEl('<math><mi>x</mi></math>')), 'x');
  strictEqual(mmlToTex(mathEl('<mi mathvariant="bold">x</mi>')), '\\mathbf{x}');
  strictEqual(mmlToTex(mathEl('<mi mathvariant="italic">y</mi>')), '\\mathit{y}');
  strictEqual(mmlToTex(mathEl('<mi mathvariant="bold">λ</mi>')), '\\mathbf{λ}');
  strictEqual(mmlToTex(mathEl('<mi mathvariant="bold">abc𝐝𝐞𝐟𝕘𝕙𝕚</mi>')), '\\mathbf{abcdef}\\mathbb{ghi}');
});

test('mmlToTex <maction> selection', () => {
  const mml = '<math><maction><mi>a</mi><mi>b</mi></maction></math>';
  const el = mathEl(mml).querySelector('maction') ?? (() => { throw new Error('maction not found'); })();
  strictEqual(mmlToTex(el), 'a', 'defaults to first child');
  el.setAttribute('selection', '1');
  strictEqual(mmlToTex(el), 'a', 'selection="1" returns first child');
  el.setAttribute('selection', '2');
  strictEqual(mmlToTex(el), 'b', 'selection="2" returns second child');
  el.setAttribute('selection', '3');
  strictEqual(mmlToTex(el), '', 'out-of-bounds selection returns empty string');
});

test('mmlToTex: <menclose> basic notations and combinations', () => {
  strictEqual(
    mmlToTex(mathEl('<math><menclose notation="box"><mi>x</mi></menclose></math>')),
    '\\boxed{x}'
  );

  strictEqual(
    mmlToTex(mathEl('<math><menclose notation="circle"><mi>x</mi></menclose></math>')),
    '\\circled{x}'
  );

  strictEqual(
    mmlToTex(mathEl('<math><menclose notation="box updiagonalstrike"><mi>x</mi></menclose></math>')),
    '\\boxed{\\cancel{x}}'
  );

  strictEqual(
    mmlToTex(mathEl('<math><menclose notation="box updiagonalstrike downdiagonalstrike"><mi>x</mi></menclose></math>')),
    '\\boxed{\\xcancel{x}}'
  );

  strictEqual(
    mmlToTex(mathEl('<math><menclose notation="top bottom"><mi>x</mi></menclose></math>')),
    '\\overline{\\underline{x}}'
  );

  strictEqual(
    mmlToTex(mathEl('<math><menclose><mi>x</mi></menclose></math>')),
    '\\longdiv{x}'
  );

  strictEqual(
    mmlToTex(mathEl('<math><menclose notation="box"><mi>x</mi><mi>y</mi></menclose></math>')),
    '\\boxed{xy}'
  );

  strictEqual(
    mmlToTex(mathEl('<math><menclose notation="box"></menclose></math>')),
    '\\boxed{}'
  );

  strictEqual(
    mmlToTex(mathEl('<math><menclose notation="left right top bottom"><mi>x</mi></menclose></math>')),
    '\\boxed{x}',
    'all four sides → box'
  );

  strictEqual(
    mmlToTex(mathEl('<math><menclose notation="left right"><mi>x</mi></menclose></math>')),
    '\\left|x\\right|',
    'left+right → leftright'
  );

  strictEqual(
    mmlToTex(mathEl('<math><menclose notation="updiagonalstrike downdiagonalstrike"><mi>x</mi></menclose></math>')),
    '\\xcancel{x}',
    'up+down diagonal → xcancel'
  );

  strictEqual(
    mmlToTex(mathEl('<math><menclose notation="actuarial"><mi>x</mi></menclose></math>')),
    '\\overline{\\left.x\\right|}',
    'actuarial → top + right (expand/collapse sequence)'
  );

  strictEqual(
    mmlToTex(mathEl('<math><menclose notation="madruwb"><mi>x</mi></menclose></math>')),
    '\\underline{\\left.x\\right|}',
    'madruwb → bottom + right'
  );

  strictEqual(
    mmlToTex(mathEl('<math><menclose notation="phasorangle"><mi>x</mi></menclose></math>')),
    '\\angle{\\underline{x}}',
    'phasorangle → angle + top (order: angle outside, top inside)'
  );

  strictEqual(
    mmlToTex(mathEl('<math><menclose notation="foobar"><mi>x</mi></menclose></math>')),
    '\\unsupportednotation-foobar{x}',
    'unknown notation → fallback'
  );
});
