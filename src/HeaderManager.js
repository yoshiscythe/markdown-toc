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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderManager = void 0;
var Header_1 = require("./models/Header");
var vscode_1 = require("vscode");
var RegexStrings_1 = require("./models/RegexStrings");
var HeaderManager = /** @class */ (function () {
    function HeaderManager(configManager) {
        this.configManager = configManager;
    }
    HeaderManager.prototype.getDocumentSymbols = function (fileUri) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode_1.commands.executeCommand("vscode.executeDocumentSymbolProvider", fileUri)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    HeaderManager.prototype.getHeaderList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var headerList, editor, fileUri, symbols, headerLevels, allHeaders, consideredDepthToInclude, index, header;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        headerList = [];
                        editor = vscode_1.window.activeTextEditor;
                        if (!(editor !== undefined)) return [3 /*break*/, 2];
                        fileUri = vscode_1.Uri.file(editor.document.fileName);
                        return [4 /*yield*/, this.getDocumentSymbols(fileUri)];
                    case 1:
                        symbols = _a.sent();
                        headerLevels = new Map();
                        allHeaders = new Array();
                        this.convertAllFirstLevelHeader(symbols, allHeaders, headerLevels);
                        consideredDepthToInclude = this.getMostPopularHeaderDepth(headerLevels);
                        for (index = 0; index < allHeaders.length; index++) {
                            header = allHeaders[index];
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
                        _a.label = 2;
                    case 2: return [2 /*return*/, headerList];
                }
            });
        });
    };
    HeaderManager.prototype.getIsHeaderIgnored = function (header, editor) {
        var previousLine = header.range.start.line - 1;
        if (previousLine > 0) {
            if (editor.document.lineAt(previousLine).text.match(RegexStrings_1.RegexStrings.Instance.REGEXP_IGNORE_TITLE)) {
                return true;
            }
        }
        return false;
    };
    HeaderManager.prototype.getMostPopularHeaderDepth = function (headerLevels) {
        var mostPopularHeaderDepth = 0;
        var mostPopularHeaderDepthCount = 0;
        headerLevels.forEach(function (value, key) {
            if (value >= mostPopularHeaderDepth) {
                mostPopularHeaderDepthCount = value;
                mostPopularHeaderDepth = key;
            }
        });
        return mostPopularHeaderDepth;
    };
    HeaderManager.prototype.convertAllFirstLevelHeader = function (symbols, allHeaders, headerLevels) {
        for (var index = 0; index < symbols.length; index++) {
            var header = new Header_1.Header(this.configManager.options.ANCHOR_MODE.value);
            header.convertFromSymbol(symbols[index]);
            allHeaders.push(header);
            var depthCount = headerLevels.get(header.depth);
            if (depthCount === undefined) {
                headerLevels.set(header.depth, 1);
            }
            else {
                depthCount = depthCount + 1;
                headerLevels.set(header.depth, depthCount);
            }
        }
    };
    HeaderManager.prototype.addHeaderChildren = function (symbol, headerList, editor) {
        if (symbol.children.length > 0) {
            for (var index = 0; index < symbol.children.length; index++) {
                var header = new Header_1.Header(this.configManager.options.ANCHOR_MODE.value);
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
    };
    HeaderManager.prototype.detectAutoOrderedHeader = function (headerList) {
        this.configManager.options.isOrderedListDetected = false;
        for (var index = 0; index < headerList.length; index++) {
            if (headerList[index].orderedListString !== undefined && headerList[index].orderedListString !== '') {
                this.configManager.options.isOrderedListDetected = true;
                break;
            }
        }
    };
    HeaderManager.prototype.calculateHeaderOrder = function (headerBeforePushToList, headerList) {
        if (headerList.length === 0) {
            // special case: First header
            var orderArray = new Array(headerBeforePushToList.depth);
            orderArray[headerBeforePushToList.depth - 1] = 1;
            return orderArray;
        }
        var lastHeaderInList = headerList[headerList.length - 1];
        if (headerBeforePushToList.depth < lastHeaderInList.depth) {
            // continue of the parent level
            var previousHeader = undefined;
            for (var index = headerList.length - 1; index >= 0; index--) {
                if (headerList[index].depth === headerBeforePushToList.depth) {
                    previousHeader = headerList[index];
                    break;
                }
            }
            if (previousHeader !== undefined) {
                var orderArray = Object.assign([], previousHeader.orderArray);
                orderArray[orderArray.length - 1]++;
                return orderArray;
            }
            else {
                // special case: first header has greater level than second header
                var orderArray = new Array(headerBeforePushToList.depth);
                orderArray[headerBeforePushToList.depth - 1] = 1;
                return orderArray;
            }
        }
        if (headerBeforePushToList.depth > lastHeaderInList.depth) {
            // child level of previous
            // order start with 1
            var orderArray = Object.assign([], lastHeaderInList.orderArray);
            orderArray.push(1);
            return orderArray;
        }
        if (headerBeforePushToList.depth === lastHeaderInList.depth) {
            // the same level, increase last item in orderArray
            var orderArray = Object.assign([], lastHeaderInList.orderArray);
            orderArray[orderArray.length - 1]++;
            return orderArray;
        }
        return [];
    };
    return HeaderManager;
}());
exports.HeaderManager = HeaderManager;
