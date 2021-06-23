"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dictionary = void 0;
class Dictionary {
    constructor(key, defaultWorkspaceValue) {
        this.key = key;
        this.lowerCaseKey = key.toLocaleLowerCase();
        this.workspaceValue = defaultWorkspaceValue;
    }
    get value() {
        if (this.uniqueValue !== undefined) {
            return this.uniqueValue;
        }
        return this.workspaceValue;
    }
}
exports.Dictionary = Dictionary;
//# sourceMappingURL=Dictionary.js.map