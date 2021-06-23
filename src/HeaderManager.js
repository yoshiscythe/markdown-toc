"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderManager = void 0;
const Header_1 = require("./models/Header");
const vscode_1 = require("vscode");
const RegexStrings_1 = require("./models/RegexStrings");
class HeaderManager {
    constructor(configManager) {
        this.configManager = configManager;
    }
    getDocumentSymbols(fileUri) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield vscode_1.commands.executeCommand("vscode.executeDocumentSymbolProvider", fileUri);
        });
    }
    getHeaderList() {
        return __awaiter(this, void 0, void 0, function* () {
            let headerList = [];
            let editor = vscode_1.window.activeTextEditor;
            if (editor !== undefined) {
                let fileUri = vscode_1.Uri.file(editor.document.fileName);
                let symbols = yield this.getDocumentSymbols(fileUri);
                let headerLevels = new Map();
                let allHeaders = new Array();
                this.convertAllFirstLevelHeader(symbols, allHeaders, headerLevels);
                let consideredDepthToInclude = this.getMostPopularHeaderDepth(headerLevels);
                for (let index = 0; index < allHeaders.length; index++) {
                    let header = allHeaders[index];
                    // only level of consideredDepthToInclude
                    if (header.depth > consideredDepthToInclude) {
                        continue;
                    }
                    header.isIgnored = this.getIsHeaderIgnored(header, editor);
                    header.orderArray = this.calculateHeaderOrder(header, headerList);
                    header.orderedListString = header.orderArray.join('.') + ".";
                    if (header.depth <= this.configManager.options.DEPTH_TO.value) {
                        headerList.push(header);
                        this.addHeaderChildren(symbols[index], headerList, editor);
                    }
                }
                // violation of clean code
                this.detectAutoOrderedHeader(headerList);
            }
            return headerList;
        });
    }
    getIsHeaderIgnored(header, editor) {
        let previousLine = header.range.start.line - 1;
        if (previousLine > 0) {
            if (editor.document.lineAt(previousLine).text.match(RegexStrings_1.RegexStrings.Instance.REGEXP_IGNORE_TITLE)) {
                return true;
            }
        }
        return false;
    }
    getMostPopularHeaderDepth(headerLevels) {
        let mostPopularHeaderDepth = 0;
        let mostPopularHeaderDepthCount = 0;
        headerLevels.forEach((value, key) => {
            if (value >= mostPopularHeaderDepth) {
                mostPopularHeaderDepthCount = value;
                mostPopularHeaderDepth = key;
            }
        });
        return mostPopularHeaderDepth;
    }
    convertAllFirstLevelHeader(symbols, allHeaders, headerLevels) {
        for (let index = 0; index < symbols.length; index++) {
            let header = new Header_1.Header(this.configManager.options.ANCHOR_MODE.value);
            header.convertFromSymbol(symbols[index]);
            allHeaders.push(header);
            let depthCount = headerLevels.get(header.depth);
            if (depthCount === undefined) {
                headerLevels.set(header.depth, 1);
            }
            else {
                depthCount = depthCount + 1;
                headerLevels.set(header.depth, depthCount);
            }
        }
    }
    addHeaderChildren(symbol, headerList, editor) {
        if (symbol.children.length > 0) {
            for (let index = 0; index < symbol.children.length; index++) {
                let header = new Header_1.Header(this.configManager.options.ANCHOR_MODE.value);
                header.convertFromSymbol(symbol.children[index]);
                header.isIgnored = this.getIsHeaderIgnored(header, editor);
                header.orderArray = this.calculateHeaderOrder(header, headerList);
                header.orderedListString = header.orderArray.join('.') + ".";
                if (header.depth <= this.configManager.options.DEPTH_TO.value) {
                    headerList.push(header);
                    this.addHeaderChildren(symbol.children[index], headerList, editor);
                }
            }
        }
    }
    detectAutoOrderedHeader(headerList) {
        this.configManager.options.isOrderedListDetected = false;
        for (let index = 0; index < headerList.length; index++) {
            if (headerList[index].orderedListString !== undefined && headerList[index].orderedListString !== '') {
                this.configManager.options.isOrderedListDetected = true;
                break;
            }
        }
    }
    calculateHeaderOrder(headerBeforePushToList, headerList) {
        if (headerList.length === 0) {
            // special case: First header
            let orderArray = new Array(headerBeforePushToList.depth);
            orderArray[headerBeforePushToList.depth - 1] = 1;
            return orderArray;
        }
        let lastHeaderInList = headerList[headerList.length - 1];
        if (headerBeforePushToList.depth < lastHeaderInList.depth) {
            // continue of the parent level
            let previousHeader = undefined;
            for (let index = headerList.length - 1; index >= 0; index--) {
                if (headerList[index].depth === headerBeforePushToList.depth) {
                    previousHeader = headerList[index];
                    break;
                }
            }
            if (previousHeader !== undefined) {
                let orderArray = Object.assign([], previousHeader.orderArray);
                orderArray[orderArray.length - 1]++;
                return orderArray;
            }
            else {
                // special case: first header has greater level than second header
                let orderArray = new Array(headerBeforePushToList.depth);
                orderArray[headerBeforePushToList.depth - 1] = 1;
                return orderArray;
            }
        }
        if (headerBeforePushToList.depth > lastHeaderInList.depth) {
            // child level of previous
            // order start with 1
            let orderArray = Object.assign([], lastHeaderInList.orderArray);
            orderArray.push(1);
            return orderArray;
        }
        if (headerBeforePushToList.depth === lastHeaderInList.depth) {
            // the same level, increase last item in orderArray
            let orderArray = Object.assign([], lastHeaderInList.orderArray);
            orderArray[orderArray.length - 1]++;
            return orderArray;
        }
        return [];
    }
}
exports.HeaderManager = HeaderManager;
//# sourceMappingURL=HeaderManager.js.map