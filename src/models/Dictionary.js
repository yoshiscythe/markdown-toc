"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dictionary = void 0;
var Dictionary = /** @class */ (function () {
    function Dictionary(key, defaultWorkspaceValue) {
        this.key = key;
        this.lowerCaseKey = key.toLocaleLowerCase();
        this.workspaceValue = defaultWorkspaceValue;
    }
    Object.defineProperty(Dictionary.prototype, "value", {
        get: function () {
            if (this.uniqueValue !== undefined) {
                return this.uniqueValue;
            }
            return this.workspaceValue;
        },
        enumerable: false,
        configurable: true
    });
    return Dictionary;
}());
exports.Dictionary = Dictionary;
