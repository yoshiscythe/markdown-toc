import {
    Range, Position, DocumentSymbol
} from 'vscode';
import { AnchorMode } from './AnchorMode';
import { Anchor } from './Anchor';
import { RegexStrings } from './RegexStrings';

export class Header {
    headerMark: string = "";
    orderedListString: string = "";
    dirtyTitle: string = "";
    range: Range;

    isIgnored: boolean = false;

    orderArray: number[] = [];

    anchorMode: AnchorMode = AnchorMode.github;

    anchor: Anchor;

    constructor(anchorMode: AnchorMode) {
        this.anchorMode = anchorMode;
        this.range = new Range(0, 0, 0, 0);
        this.anchor = new Anchor("");
    }

    public convertFromSymbol(symbol: DocumentSymbol) {
        let headerTextSplit = symbol.name.match(RegexStrings.Instance.REGEXP_HEADER_META);

        console.log("header  "+headerTextSplit);
        console.log("synbolname  "+symbol.name);

        if (headerTextSplit !== null) {
            this.headerMark = headerTextSplit[1];
            this.orderedListString = headerTextSplit[3];
            this.dirtyTitle = headerTextSplit[2];
        }

        this.range = new Range(symbol.range.start, new Position(symbol.range.start.line, symbol.name.length));
        this.anchor = new Anchor(this.cleanUpTitle(this.dirtyTitle));
    }

    public get depth(): number {
        return this.headerMark.length;
    }

    public get isHeader(): boolean {
        return this.headerMark !== "";
    }

    public tocRowWithAnchor(tocString: string): string {
        let title = this.cleanUpTitle(tocString);
        let anchor_markdown_header = require('anchor-markdown-header');
        return anchor_markdown_header(title, this.anchorMode);
    }

    public get tocWithoutOrder(): string {
        return this.dirtyTitle;
    }

    public get tocWithOrder(): string {
        return this.orderArray.join('.') + ". " + this.tocWithoutOrder;
    }

    public get fullHeaderWithOrder(): string {
        return this.headerMark + " " + this.tocWithOrder;
    }

    public get fullHeaderWithoutOrder(): string {
        return this.headerMark + " " + this.tocWithoutOrder;
    }

    private cleanUpTitle(dirtyTitle: string) {
        let title = dirtyTitle.replace(/\[(.+)]\([^)]*\)/gi, "$1"); // replace link
        title = title.replace(/<!--.+-->/gi, ""); // replace comment
        title = title.replace(/\#*`|\(|\)/gi, "").trim(); // replace special char
        return title;
    }
}
