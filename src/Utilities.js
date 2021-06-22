"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utilities = void 0;
var RegexStrings_1 = require("./models/RegexStrings");
var Utilities = /** @class */ (function () {
    function Utilities() {
    }
    Utilities.getNextLineIndexIsNotInCode = function (index, doc) {
        for (var currentLineIndex = index + 1; currentLineIndex < doc.lineCount; currentLineIndex++) {
            if (this.isLineStartOrEndOfCodeBlock(currentLineIndex, doc)) {
                return currentLineIndex + 1;
            }
        }
        return doc.lineCount - 1;
    };
    Utilities.isLineStartOrEndOfCodeBlock = function (lineNumber, doc) {
        var nextLine = doc.lineAt(lineNumber).text;
        var isCodeStyle1 = nextLine.match(RegexStrings_1.RegexStrings.Instance.REGEXP_CODE_BLOCK1) !== null;
        var isCodeStyle2 = nextLine.match(RegexStrings_1.RegexStrings.Instance.REGEXP_CODE_BLOCK2) !== null;
        return isCodeStyle1 || isCodeStyle2;
    };
    return Utilities;
}());
exports.Utilities = Utilities;
