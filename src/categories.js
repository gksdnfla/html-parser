function getClassIds() {
    const arr = [
        'COMMENT',
        'SPACE',
        'TEXT',
        'DOCTYPE',
        'html',
        'head',
        'frameset',
        'frame',
        'style',
        'script',
        'template',
        'noscript',
        'meta',
        'title',
        'noframes',
        'OtherMeta',
        'body',
        'col',
        'colgroup',
        'caption',
        'TCell',
        'tr',
        'TBody',
        'table',
        'xmp',
        'form',
        'p',
        'address',
        'div',
        'Listing',
        'List',
        'DlQuote',
        'li',
        'DListItem',
        'Heading',
        'OtherBlock',
        'button',
        'Applet',
        'select',
        'optgroup',
        'option',
        'a',
        'nobr',
        'HtmlFont',
        'OtherFmt',
        'SubSup',
        'hr',
        'br',
        'img',
        'image',
        'embed',
        'textarea',
        'keygen',
        'input',
        'hiddenInput',
        'AreaWbr',
        'OtherVoid',
        'OtherRaw',
        'OtherHtml',
        'math',
        'svg',
        'EmbedXml',
        'EmbedHtml',
        'OtherForeign',
    ];
    let obj = {};

    arr.forEach((item, index) => (obj[item] = index));

    return obj;
}

const classIds = getClassIds();

const ClassVecs = {};
for (const k in classIds) ClassVecs[k] = 1n << BigInt(classIds[k]);

const C = Object.assign({}, ClassVecs);

C.RcDataElement = C.textarea | C.title;

C.RawTextElement = C.style | C.script | C.xmp | C.noframes | C.OtherRaw;

C.VoidElement =
    C.embed |
    C.img |
    C.image |
    C.hr |
    C.br |
    C.col |
    C.frame |
    C.AreaWbr |
    C.input |
    C.keygen |
    C.hiddenInput |
    C.OtherVoid |
    C.OtherMeta |
    C.meta;

C.FormattingContextElement =
    C.html | C.template | C.caption | C.table | C.TCell | C.Applet;

C.FormattingElement = C.a | C.nobr | C.HtmlFont | C.OtherFmt;

C.SpecialBlockElement =
    C.div |
    C.address |
    C.li |
    C.List |
    C.Heading |
    C.DListItem |
    C.DlQuote |
    C.Listing |
    C.p |
    C.OtherBlock |
    C.xmp |
    C.form;

C.BreakoutElement =
    C.body |
    C.head |
    C.table |
    C.SubSup |
    (C.FormattingElement & ~C.a) |
    C.embed |
    C.img |
    C.image |
    C.hr |
    C.br |
    C.meta |
    C.div |
    C.li |
    C.List |
    C.Heading |
    C.DListItem |
    C.DlQuote |
    C.Listing |
    C.p;

C.Tabular = C.caption | C.colgroup | C.col | C.TBody | C.tr | C.TCell;

C.Meta =
    C.title |
    C.script |
    C.style |
    C.template |
    C.noscript |
    C.noframes |
    C.meta |
    C.OtherMeta;

C.FlowContent = ~(
    C.DOCTYPE |
    C.html |
    C.head |
    C.body |
    C.frameset |
    C.frame |
    C.Tabular |
    C.EmbedXml |
    C.EmbedHtml |
    C.OtherForeign
);

C.PhrasingContent = C.FlowContent & ~C.SpecialBlockElement;

C.FosterParentedContent =
    C.FlowContent &
    ~(
        C.table |
        C.Tabular |
        C.script |
        C.style |
        C.template |
        C.hiddenInput |
        C.COMMENT |
        C.SPACE |
        C.form
    );

C.ForeignElement = C.math | C.svg | C.EmbedXml | C.EmbedHtml | C.OtherForeign;

C.Reformat =
    C.AreaWbr |
    C.input |
    C.keygen |
    C.Applet |
    C.OtherHtml |
    C.FormattingElement |
    C.select |
    C.optgroup |
    C.option |
    C.button |
    C.math |
    C.svg |
    C.br |
    C.xmp |
    C.TEXT |
    C.SPACE;

C.FramesetOK =
    C.optgroup |
    C.option |
    C.div |
    C.address |
    C.p |
    C.Heading |
    C.List |
    C.FormattingElement |
    C.OtherVoid |
    C.DlQuote |
    C.OtherBlock |
    C.form |
    C.OtherHtml |
    C.COMMENT |
    C.SPACE |
    C.DOCTYPE |
    C.html |
    C.head |
    C.body |
    C.svg |
    C.math |
    C.SubSup |
    C.hiddenInput |
    C.EmbedHtml |
    C.OtherForeign |
    C.EmbedXml |
    C.frame |
    C.frameset |
    C.noframes;

const states = {
    main: 1 << 0,
    inTable: 1 << 1,
    inSvg: 1 << 2,
    inMath: 1 << 3,
    inSelect: 1 << 4,
    inPhrasing: 1 << 5,
};

const None = 0n;

function printKind(info) {
    if (info === ~0n) return 'Any';
    if (info === 0n) return 'None';
    const _info = info < 0n ? ~info : info;
    const r = [];
    for (let k in ClassVecs) if (ClassVecs[k] & _info) r.push(k);

    return (
        (info < 0n ? '~' : '') + (r.length === 1 ? r[0] : `(${r.join('|')})`)
    );
}

export { classIds, ClassVecs, C, states, None };
