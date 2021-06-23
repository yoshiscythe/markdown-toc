"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utilities = void 0;
const RegexStrings_1 = require("./models/RegexStrings");
class Utilities {
    static getNextLineIndexIsNotInCode(index, doc) {
        for (let currentLineIndex = index + 1; currentLineIndex < doc.lineCount; currentLineIndex++) {
            if (this.isLineStartOrEndOfCodeBlock(currentLineIndex, doc)) {
                return currentLineIndex + 1;
            }
        }
        return doc.lineCount - 1;
    }
    static isLineStartOrEndOfCodeBlock(lineNumber, doc) {
        let nextLine = doc.lineAt(lineNumber).text;
        let isCodeStyle1 = nextLine.match(RegexStrings_1.RegexStrings.Instance.REGEXP_CODE_BLOCK1) !== null;
        let isCodeStyle2 = nextLine.match(RegexStrings_1.RegexStrings.Instance.REGEXP_CODE_BLOCK2) !== null;
        return isCodeStyle1 || isCodeStyle2;
    }
}
exports.Utilities = Utilities;
//# sourceMappingURL=Utilities.js.map