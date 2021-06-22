"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = void 0;
var vscode_1 = require("vscode");
var AnchorMode_1 = require("./AnchorMode");
var Anchor_1 = require("./Anchor");
var RegexStrings_1 = require("./RegexStrings");
var Header = /** @class */ (function () {
    function Header(anchorMode) {
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
    Header.prototype.convertFromSymbol = function (symbol) {
        var headerTextSplit = symbol.name.match(RegexStrings_1.RegexStrings.Instance.REGEXP_HEADER_META);
        if (headerTextSplit !== null) {
            this.headerMark = headerTextSplit[1];
            this.orderedListString = headerTextSplit[2];
            this.dirtyTitle = headerTextSplit[4];
        }
        this.range = new vscode_1.Range(symbol.range.start, new vscode_1.Position(symbol.range.start.line, symbol.name.length));
        this.anchor = new Anchor_1.Anchor(this.cleanUpTitle(this.dirtyTitle));
    };
    Object.defineProperty(Header.prototype, "depth", {
        get: function () {
            return this.headerMark.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Header.prototype, "isHeader", {
        get: function () {
            return this.headerMark !== "";
        },
        enumerable: false,
        configurable: true
    });
    Header.prototype.tocRowWithAnchor = function (tocString) {
        var title = this.cleanUpTitle(tocString);
        var anchor_markdown_header = require('anchor-markdown-header');
        return anchor_markdown_header(title, this.anchorMode);
    };
    Object.defineProperty(Header.prototype, "tocWithoutOrder", {
        get: function () {
            return this.dirtyTitle;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Header.prototype, "tocWithOrder", {
        get: function () {
            return this.orderArray.join('.') + ". " + this.tocWithoutOrder;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Header.prototype, "fullHeaderWithOrder", {
        get: function () {
            return this.headerMark + " " + this.tocWithOrder;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Header.prototype, "fullHeaderWithoutOrder", {
        get: function () {
            return this.headerMark + " " + this.tocWithoutOrder;
        },
        enumerable: false,
        configurable: true
    });
    Header.prototype.cleanUpTitle = function (dirtyTitle) {
        var title = dirtyTitle.replace(/\[(.+)]\([^)]*\)/gi, "$1"); // replace link
        title = title.replace(/<!--.+-->/gi, ""); // replace comment
        title = title.replace(/\#*`|\(|\)/gi, "").trim(); // replace special char
        return title;
    };
    return Header;
}());
exports.Header = Header;
