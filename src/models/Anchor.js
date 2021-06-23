"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Anchor = void 0;
class Anchor {
    constructor(headerText) {
        this.id = "";
        this.name = "";
        headerText = headerText.toLowerCase().replace(/\s/gi, "-");
        this.id = "markdown-" + encodeURIComponent(headerText);
        this.name = encodeURIComponent(headerText);
    }
}
exports.Anchor = Anchor;
//# sourceMappingURL=Anchor.js.map