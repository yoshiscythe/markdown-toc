"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegexStrings = void 0;
class RegexStrings {
    constructor() {
        this.REGEXP_TOC_START = /\s*<!--(.*)[^\/]TOC(.*)-->/gi;
        this.REGEXP_TOC_STOP = /\s*<!--(.*)\/TOC(.*)-->/gi;
        this.REGEXP_TOC_CONFIG = /\w+[:=][^\s]+/gi;
        this.REGEXP_TOC_CONFIG_ITEM = /(\w+)[:=]([^\s]+)/;
        this.REGEXP_MARKDOWN_ANCHOR = /^<a id="markdown-.+" name=".+"><\/a\>/;
        this.REGEXP_CODE_BLOCK1 = /^\s?```/;
        this.REGEXP_CODE_BLOCK2 = /^\s?~~~/;
        this.REGEXP_ANCHOR = /\[.+\]\(#(.+)\)/;
        this.REGEXP_IGNORE_TITLE = /<!-- TOC ignore:true -->/;
        this.REGEXP_HEADER_META = /^(\#*)\s*((\d*\.?)*)\s*(.+)/;
        this.REGEXP_UNIQUE_CONFIG_START = /\s*<!--(.*)[^\/]TOC UNIQUE CONFIGS(.*)-->/gi;
        this.REGEXP_UNIQUE_CONFIG_STOP = /\s*<!--(.*)\/TOC UNIQUE CONFIGS(.*)-->/gi;
        this.REGEXP_UNIQUE_CONFIG_LINE = /\s*<!--( *)(\w+)[:](\w+)( *)-->/gi;
    }
    static get Instance() {
        return this._instance || (this._instance = new this());
    }
}
exports.RegexStrings = RegexStrings;
//# sourceMappingURL=RegexStrings.js.map