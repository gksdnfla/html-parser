import {
    C,
    None,
    classIds as c,
    states as S,
    printKind,
} from './categories.js';

const _unclosable =
    C.DOCTYPE |
    C.COMMENT |
    C.TEXT |
    C.SPACE |
    C.VoidElement |
    C.RcDataElement |
    C.RawTextElement |
    C.html |
    C.body;

class Rule {
    constructor(r, name = r.name) {
        this.name = name;
        this.state = r.state ?? 0;
        this.hidenest = r.hidenest ?? None;
        this.hide = (r.hide ?? None) | _unclosable;
        this.escalate = r.escalate ?? None;
        this.content = (r.content ?? None) | (r.trap ?? None);
        this.trap = r.trap ?? None;
        this.openFor = (r.openFor ?? None) & ~this.content;
        this.paths = r.paths ?? null;
        this.siblingRules = r.siblingRules ?? false;
    }

    get info() {
        const info = Object.assign({}, this);
        for (let k in info)
            if (typeof info[k] === 'bigint') info[k] = printKind(info[k]);

        return info;
    }
}

const hideInFlow =
    ~(
        (
            C.table |
            C.Tabular |
            C.button |
            C.Applet |
            C.SpecialBlockElement
        ) /*| C.OtherFmt*/
    ) |
    C.form |
    C.p;

const Rules = {
    fragmentRule: {
        hide: All,
        state: S.main,
        content: Any,
    },

    documentRule: {
        state: S.main,
        hide: All,
        content: C.html | C.COMMENT | C.DOCTYPE,
        openFor: ~(C.SPACE | C.DOCTYPE | C.Tabular),
        paths: { '#default': 'html' },
        siblingRules: true,
    },

    beforeHtml: {
        content: C.html | C.COMMENT,
        hide: All,
        openFor: ~(C.SPACE | C.DOCTYPE | C.Tabular),
        paths: { '#default': 'html' },
        siblingRules: true,
    },

    beforeHead: {
        content: C.head | C.COMMENT,
        hide: ~C.html,
        openFor: ~(C.SPACE | C.DOCTYPE | C.Tabular | C.html),
        paths: { '#default': 'head' },
        siblingRules: true,
    },

    inHead: {
        hide: ~(C.html | C.head),
        escalate: C.FlowContent | C.body | C.frameset,
        content: C.Meta | C.SPACE | C.COMMENT,
    },

    afterHead: {
        hide: ~C.html,
        content: C.body | C.frameset | C.COMMENT | C.SPACE,
        openFor: ~(
            (C.Meta & ~C.noscript) |
            C.frame |
            C.frameset |
            C.SPACE |
            C.DOCTYPE |
            C.Tabular |
            C.html |
            C.head
        ),
        paths: { '#default': 'body' },
        trap: C.Meta & ~C.noscript,
        siblingRules: true,
    },

    inBody: {
        hide: ~(C.html | C.body),
        content: C.FlowContent,
        trap: C.frameset,
    },

    inFrameset: {
        hide: ~(C.html | C.body | C.frameset),
        content: C.frameset | C.frame | C.noframes | C.SPACE | C.COMMENT,
    },

    inTable: {
        state: S.inTable,
        hide: All,
        content:
            C.caption |
            C.colgroup |
            C.TBody |
            C.script |
            C.template |
            C.style |
            C.hiddenInput |
            C.SPACE |
            C.COMMENT |
            C.form,
        openFor: C.col | C.tr | C.TCell,
        paths: { col: 'colgroup', tr: 'tbody', td: 'tbody', th: 'tbody' },
        trap: C.FosterParentedContent,
    },

    inColgroup: {
        hide: ~C.table,
        escalate: C.Tabular | C.FlowContent,
        content: C.col | C.template | C.SPACE | C.COMMENT,
        trap: None,
    },

    inTableBody: {
        hide: ~C.table,
        escalate: C.Tabular & ~(C.tr | C.TCell),
        content:
            C.tr |
            C.script |
            C.template |
            C.style |
            C.hiddenInput |
            C.SPACE |
            C.COMMENT |
            C.form,
        openFor: C.TCell,
        paths: { td: 'tr', th: 'tr' },
        trap: C.FosterParentedContent,
    },

    inTableRow: {
        hide: ~(C.table | C.TBody),
        escalate: C.Tabular & ~C.TCell,
        content:
            C.TCell |
            C.script |
            C.style |
            C.template |
            C.hiddenInput |
            C.SPACE |
            C.COMMENT,
        trap: C.FosterParentedContent,
    },

    inSelect: {
        hidenest: C.option,
        state: S.inSelect | S.main,
        hide: ~(C.table | C.caption | C.TBody | C.tr | C.TCell),
        escalate:
            C.input |
            C.keygen |
            C.textarea |
            C.caption |
            C.TBody |
            C.tr |
            C.TCell,
        content:
            C.option |
            C.optgroup |
            C.script |
            C.template |
            C.TEXT |
            C.SPACE |
            C.COMMENT,
    },

    inSelectInTable: {
        hidenest: C.option,
        state: S.inSelect | S.main,
        hide: ~(C.table | C.caption | C.TBody | C.tr | C.TCell),
        escalate:
            C.input |
            C.keygen |
            C.textarea |
            C.caption |
            C.TBody |
            C.tr |
            C.TCell |
            C.table,
        content:
            C.option |
            C.optgroup |
            C.script |
            C.template |
            C.TEXT |
            C.SPACE |
            C.COMMENT,
    },

    optgroupInSelect: {
        hide: ~(C.table | C.caption | C.TBody | C.tr | C.TCell | C.select),
        escalate: C.caption | C.tr | C.TBody | C.TCell | C.optgroup,
        content:
            C.option | C.script | C.template | C.TEXT | C.SPACE | C.COMMENT,
    },

    optionInSelect: {
        hide: ~(
            C.table |
            C.caption |
            C.TBody |
            C.tr |
            C.TCell |
            C.select |
            C.optgroup
        ),
        escalate: C.caption | C.tr | C.TBody | C.TCell | C.optgroup | C.option,
        content: C.script | C.template | C.TEXT | C.SPACE | C.COMMENT,
    },

    inCaption: {
        hidenest: C.table,
        hide: ~C.table,
        escalate: C.Tabular,
        content: C.FlowContent,
    },

    inTableCell: {
        hidenest: C.table,
        hide: ~(C.table | C.tr | C.TBody),
        escalate: C.Tabular,
        content: C.FlowContent,
    },

    inApplet: {
        hidenest: C.li | C.DListItem | C.Heading | C.option | C.button,
        hide: hideInFlow | C.SpecialBlockElement | C.Applet,
        escalate: C.Tabular,
        content: C.FlowContent,
    },

    inList: {
        hidenest: C.li | C.DListItem | C.Heading | C.option,
        hide: hideInFlow | C.li,
        escalate: C.frameset | C.Tabular,
        content: C.FlowContent,
    },

    inListItem: {
        hidenest: C.DListItem | C.Heading | C.option,
        hide: hideInFlow & ~C.form,
        escalate: C.Tabular,
        content: C.FlowContent,
    },

    inDListItem: {
        hidenest: C.li | C.Heading | C.option,
        hide: hideInFlow & ~C.form,
        escalate: C.frameset | C.Tabular,
        content: C.FlowContent,
    },

    inDivAddress: {
        hidenest: C.Heading | C.option,
        hide: hideInFlow,
        escalate: C.frameset | C.Tabular,
        content: C.FlowContent,
    },

    inOtherBlock: {
        hidenest: C.li | C.DListItem | C.Heading | C.option,
        hide: hideInFlow,
        escalate: C.frameset | C.Tabular,
        content: C.FlowContent,
    },

    inEmbeddedHtml: {
        state: S.main,
        hidenest: C.li | C.DListItem | C.Heading | C.option,
        hide: ~(C.svg | C.math | C.table | C.Tabular),
        escalate: C.frameset | C.Tabular,
        content: C.FlowContent,
    },

    optionInFlow: {
        hidenest: C.Heading,
        hide: C.ForeignElement | C.html | C.body,
        escalate: C.frameset | C.Tabular | C.optgroup,
        content: C.FlowContent & ~C.optgroup,
    },

    optgroupInFlow: {
        hidenest: C.Heading,
        hide: C.ForeignElement | C.html | C.body,
        escalate: C.frameset | C.Tabular,
        content: C.FlowContent,
    },

    otherInFlow: {
        hidenest: C.Heading | C.option,
        hide: C.ForeignElement | C.html | C.body | C.form,
        escalate: C.frameset | C.Tabular,
        content: C.FlowContent,
    },

    inPhrasing: {
        hidenest: C.option,
        state: S.main | S.inPhrasing,
        hide:
            ~(
                C.table |
                C.Tabular |
                C.button |
                C.Applet |
                C.SpecialBlockElement
            ) | C.form,
        escalate: C.frameset | C.Tabular | C.SpecialBlockElement,
        content: C.PhrasingContent,
    },

    optionInPhrasing: {
        state: S.main | S.inPhrasing,
        hide: C.ForeignElement | C.html | C.body,
        escalate:
            C.frameset |
            C.Tabular |
            C.optgroup |
            C.Heading |
            C.SpecialBlockElement,
        content: C.PhrasingContent & ~C.optgroup,
    },

    optgroupInPhrasing: {
        hidenest: C.Heading,
        hide: C.ForeignElement | C.html | C.body,
        escalate: C.frameset | C.Tabular | C.SpecialBlockElement,
        content: C.PhrasingContent,
    },

    otherInPhrasing: {
        hidenest: C.option,
        state: S.main | S.inPhrasing,
        hide: C.ForeignElement | C.html | C.body | C.form,
        escalate: C.frameset | C.Tabular | C.SpecialBlockElement,
        content: C.PhrasingContent,
    },

    inData: {
        content: C.SPACE | C.TEXT,
        escalate: All,
    },

    inSvg: {
        state: S.inSvg,
        hide: C.form,
        escalate: C.frameset | C.Tabular | C.BreakoutElement,
        content: C.ForeignElement | C.SPACE | C.TEXT | C.COMMENT,
    },

    inMath: {
        state: S.inMath,
        hide: C.form,
        escalate: C.frameset | C.Tabular | C.BreakoutElement,
        content: C.ForeignElement | C.SPACE | C.TEXT | C.COMMENT,
    },

    otherInForeign: {
        hide: C.form,
        escalate: C.frameset | C.Tabular | C.BreakoutElement,
        content: C.ForeignElement | C.SPACE | C.TEXT | C.COMMENT,
    },

    inEmbeddedXml: {
        state: S.main | S.inMath | S.inSvg,
        escalate: C.BreakoutElement | C.frameset,
        content: C.ForeignElement | C.SPACE | C.TEXT | C.COMMENT,
    },

    afterBody: {
        hide: All,
    },

    afterFrameset: {
        hide: All,
        content: C.noframes | C.SPACE | C.COMMENT,
    },

    afterHtmlAfterBody: {
        hide: All,
        content: None,
    },

    afterHtmlAfterFrameset: {
        hide: All,
        content: C.COMMENT,
    },
};

for (const k in Rules) {
    Rules[k] = new Rule(Rules[k], k);
}

function childRule(ctx, id) {
    switch (id) {
        case c.select:
            return ctx & S.inTable ? R.inSelectInTable : defaultRules[id];

        case c.option:
            return ctx & S.inSelect
                ? R.optionInSelect
                : ctx & S.inPhrasing
                ? R.optionInPhrasing
                : defaultRules[id];

        case c.optgroup:
            return ctx & S.inSelect
                ? R.optgroupInSelect
                : ctx & S.inPhrasing
                ? R.optgroupInPhrasing
                : defaultRules[id];

        default:
            const rule = defaultRules[id];
            return rule === R.otherInFlow && ctx & S.inPhrasing
                ? R.otherInPhrasing
                : rule;
    }
}

function siblingRule({ id: parentClass, children }, name, id, _allOpened) {
    if (parentClass === -1)
        return children & C.html
            ? _allOpened & C.frameset
                ? R.afterHtmlAfterFrameset
                : R.afterHtmlAfterBody
            : children & C.DOCTYPE
            ? R.beforeHtml
            : R.beforeDoctype;

    if (parentClass === c.html)
        return children & C.frameset
            ? R.afterFrameset
            : children & C.body
            ? R.afterBody
            : children & C.head
            ? R.afterHead
            : R.beforeHead;

    return null;
}
