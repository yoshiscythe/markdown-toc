"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Anchor = void 0;
var Anchor = /** @class */ (function () {
    function Anchor(headerText) {
        this.id = "";
        this.name = "";
        headerText = headerText.toLowerCase().replace(/\s/gi, "-");
        this.id = "markdown-" + encodeURIComponent(headerText);
        this.name = encodeURIComponent(headerText);
    }
    return Anchor;
}());
exports.Anchor = Anchor;
