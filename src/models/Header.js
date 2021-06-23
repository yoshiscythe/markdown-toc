"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = void 0;
const vscode_1 = require("vscode");
const AnchorMode_1 = require("./AnchorMode");
const Anchor_1 = require("./Anchor");
const RegexStrings_1 = require("./RegexStrings");
class Header {
    constructor(anchorMode) {
        this.headerMark = "";
        this.orderedListString = "";
        this.dirtyTitle = "";
        this.isIgnored = false;
        this.orderArray = [];
        this.anchorMode = AnchorMode_1.AnchorMode.github;
        this.anchorMode = anchorMode;
        this.range = new vscode_1.Range(0, 0, 0, 0);
        this.anchor = new Anchor_1.Anchor("");
    }
    convertFromSymbol(symbol) {
        let headerTextSplit = symbol.name.match(RegexStrings_1.RegexStrings.Instance.REGEXP_HEADER_META);
        if (headerTextSplit !== null) {
            this.headerMark = headerTextSplit[1];
            this.orderedListString = headerTextSplit[2];
            this.dirtyTitle = headerTextSplit[4];
        }
        this.range = new vscode_1.Range(symbol.range.start, new vscode_1.Position(symbol.range.start.line, symbol.name.length));
        this.anchor = new Anchor_1.Anchor(this.cleanUpTitle(this.dirtyTitle));
    }
    get depth() {
        return this.headerMark.length;
    }
    get isHeader() {
        return this.headerMark !== "";
    }
    tocRowWithAnchor(tocString) {
        let title = this.cleanUpTitle(tocString);
        let anchor_markdown_header = require('anchor-markdown-header');
        return anchor_markdown_header(title, this.anchorMode);
    }
    get tocWithoutOrder() {
        return this.dirtyTitle;
    }
    get tocWithOrder() {
        return this.orderArray.join('.') + ". " + this.tocWithoutOrder;
    }
    get fullHeaderWithOrder() {
        return this.headerMark + " " + this.tocWithOrder;
    }
    get fullHeaderWithoutOrder() {
        return this.headerMark + " " + this.tocWithoutOrder;
    }
    cleanUpTitle(dirtyTitle) {
        let title = dirtyTitle.replace(/\[(.+)]\([^)]*\)/gi, "$1"); // replace link
        title = title.replace(/<!--.+-->/gi, ""); // replace comment
        title = title.replace(/\#*`|\(|\)/gi, "").trim(); // replace special char
        return title;
    }
}
exports.Header = Header;
//# sourceMappingURL=Header.js.map