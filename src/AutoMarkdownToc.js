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
exports.AutoMarkdownToc = void 0;
var vscode_1 = require("vscode");
var ConfigManager_1 = require("./ConfigManager");
var HeaderManager_1 = require("./HeaderManager");
var AnchorMode_1 = require("./models/AnchorMode");
var RegexStrings_1 = require("./models/RegexStrings");
var Utilities_1 = require("./Utilities");
var AutoMarkdownToc = /** @class */ (function () {
    function AutoMarkdownToc() {
        this.configManager = new ConfigManager_1.ConfigManager();
        this.headerManager = new HeaderManager_1.HeaderManager(this.configManager);
    }
    AutoMarkdownToc.prototype.onDidSaveTextDocument = function () {
        if (!this.configManager.options.UPDATE_ON_SAVE.value) {
            return;
        }
        // Prevent save loop
        if (this.configManager.options.isProgrammaticallySave) {
            this.configManager.options.isProgrammaticallySave = false;
            return;
        }
        var editor = vscode_1.window.activeTextEditor;
        if (editor !== undefined) {
            var doc = editor.document;
            if (doc.languageId !== 'markdown') {
                return;
            }
            var tocRange = this.getTocRange();
            if (!tocRange.isSingleLine) {
                this.updateMarkdownToc();
                this.configManager.options.isProgrammaticallySave = true;
                doc.save();
            }
        }
    };
    AutoMarkdownToc.prototype.updateMarkdownToc = function () {
        return __awaiter(this, void 0, void 0, function () {
            var autoMarkdownToc, editor, tocRange, headerList, document;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        autoMarkdownToc = this;
                        editor = vscode_1.window.activeTextEditor;
                        if (editor === undefined) {
                            return [2 /*return*/];
                        }
                        autoMarkdownToc.configManager.updateOptions();
                        tocRange = autoMarkdownToc.getTocRange();
                        return [4 /*yield*/, autoMarkdownToc.headerManager.getHeaderList()];
                    case 1:
                        headerList = _a.sent();
                        document = editor.document;
                        editor.edit(function (editBuilder) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (!tocRange.isSingleLine) {
                                    editBuilder.delete(tocRange);
                                    autoMarkdownToc.deleteAnchors(editBuilder);
                                }
                                // TODO: need to go back to this
                                // if (this.configManager.options.DETECT_AUTO_SET_SECTION.value) { // } && this.configManager.options.isOrderedListDetected) {
                                //     autoMarkdownToc.updateHeadersWithSections(editBuilder, headerList, document);
                                //     //rebuild header list, because headers have changed
                                //     headerList = await autoMarkdownToc.headerManager.getHeaderList();
                                // }
                                autoMarkdownToc.createToc(editBuilder, headerList, tocRange.start);
                                autoMarkdownToc.insertAnchors(editBuilder, headerList);
                                return [2 /*return*/];
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoMarkdownToc.prototype.deleteMarkdownToc = function () {
        var autoMarkdownToc = this;
        var editor = vscode_1.window.activeTextEditor;
        if (editor === undefined) {
            return;
        }
        editor.edit(function (editBuilder) {
            var tocRange = autoMarkdownToc.getTocRange();
            if (tocRange.isSingleLine) {
                return;
            }
            editBuilder.delete(tocRange);
            autoMarkdownToc.deleteAnchors(editBuilder);
        });
    };
    AutoMarkdownToc.prototype.updateHeadersWithSections = function (editBuilder, headerList, document) {
        var _this = this;
        headerList.forEach(function (header) {
            if (header.range.start.line !== 0 && !document.lineAt(header.range.start.line - 1).isEmptyOrWhitespace) {
                editBuilder.insert(new vscode_1.Position(header.range.start.line, 0), _this.configManager.options.lineEnding);
            }
            if (_this.configManager.options.ORDERED_LIST.value) {
                editBuilder.replace(header.range, header.fullHeaderWithOrder);
            }
            else {
                editBuilder.replace(header.range, header.fullHeaderWithoutOrder);
            }
        });
    };
    AutoMarkdownToc.prototype.updateMarkdownSections = function () {
        return __awaiter(this, void 0, void 0, function () {
            var headerList, editor, config, document_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.configManager.updateOptions();
                        return [4 /*yield*/, this.headerManager.getHeaderList()];
                    case 1:
                        headerList = _a.sent();
                        editor = vscode_1.window.activeTextEditor;
                        config = this.configManager;
                        if (editor !== undefined) {
                            config.options.isOrderedListDetected = true;
                            document_1 = editor.document;
                            editor.edit(function (editBuilder) {
                                _this.updateHeadersWithSections(editBuilder, headerList, document_1);
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoMarkdownToc.prototype.deleteMarkdownSections = function () {
        return __awaiter(this, void 0, void 0, function () {
            var headerList, editor, config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.configManager.updateOptions();
                        return [4 /*yield*/, this.headerManager.getHeaderList()];
                    case 1:
                        headerList = _a.sent();
                        editor = vscode_1.window.activeTextEditor;
                        config = this.configManager;
                        if (editor !== undefined && headerList !== undefined) {
                            config.options.isOrderedListDetected = false;
                            editor.edit(function (editBuilder) {
                                headerList.forEach(function (element) {
                                    editBuilder.replace(element.range, element.fullHeaderWithoutOrder);
                                });
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get TOC range, in case of no TOC, return the active line
     * In case of the editor is not available, return the first line
     */
    AutoMarkdownToc.prototype.getTocRange = function () {
        var editor = vscode_1.window.activeTextEditor;
        if (editor === undefined) {
            return new vscode_1.Range(0, 0, 0, 0);
        }
        var doc = editor.document;
        var start, end;
        for (var index = 0; index < doc.lineCount; index++) {
            if (Utilities_1.Utilities.isLineStartOrEndOfCodeBlock(index, doc)) {
                index = Utilities_1.Utilities.getNextLineIndexIsNotInCode(index, doc);
            }
            var lineText = doc.lineAt(index).text;
            if ((start === undefined) && (lineText.match(RegexStrings_1.RegexStrings.Instance.REGEXP_TOC_START) && !lineText.match(RegexStrings_1.RegexStrings.Instance.REGEXP_IGNORE_TITLE))) {
                start = new vscode_1.Position(index, 0);
            }
            else if (lineText.match(RegexStrings_1.RegexStrings.Instance.REGEXP_TOC_STOP)) {
                end = new vscode_1.Position(index, lineText.length);
                break;
            }
        }
        if ((start === undefined) || (end === undefined)) {
            if (start !== undefined) {
                end = start;
            }
            else if (end !== undefined) {
                start = end;
            }
            else {
                start = editor.selection.active;
                end = editor.selection.active;
            }
        }
        return new vscode_1.Range(start, end);
    };
    /**
     * insert anchor for a header
     * @param editBuilder
     * @param header
     */
    AutoMarkdownToc.prototype.insertAnchor = function (editBuilder, header) {
        var anchorMatches = header.tocRowWithAnchor(header.tocWithoutOrder).match(RegexStrings_1.RegexStrings.Instance.REGEXP_ANCHOR);
        if (anchorMatches !== null) {
            // let name = anchorMatches[1];
            var text = [
                this.configManager.options.lineEnding,
                '<a id="',
                header.anchor.id,
                '" name="',
                header.anchor.name,
                '"></a>'
            ];
            var insertPosition = new vscode_1.Position(header.range.end.line, header.range.end.character);
            if (this.configManager.options.ANCHOR_MODE.value === AnchorMode_1.AnchorMode.bitbucket) {
                text = text.slice(1);
                text.push(this.configManager.options.lineEnding);
                text.push(this.configManager.options.lineEnding);
                insertPosition = new vscode_1.Position(header.range.start.line, 0);
            }
            editBuilder.insert(insertPosition, text.join(''));
        }
    };
    AutoMarkdownToc.prototype.insertAnchors = function (editBuilder, headerList) {
        var _this = this;
        if (!this.configManager.options.INSERT_ANCHOR.value) {
            return;
        }
        headerList.forEach(function (header) {
            _this.insertAnchor(editBuilder, header);
        });
    };
    AutoMarkdownToc.prototype.deleteAnchors = function (editBuilder) {
        var editor = vscode_1.window.activeTextEditor;
        if (editor !== undefined) {
            var doc = editor.document;
            for (var index = 0; index < doc.lineCount; index++) {
                var lineText = doc.lineAt(index).text;
                if (lineText.match(RegexStrings_1.RegexStrings.Instance.REGEXP_MARKDOWN_ANCHOR) === null) {
                    continue;
                }
                var startPosition = this.getStartPositionOfAnchorLine(index, doc);
                var range = new vscode_1.Range(startPosition, new vscode_1.Position(startPosition.line + 1, 0));
                editBuilder.delete(range);
            }
        }
    };
    AutoMarkdownToc.prototype.getStartPositionOfAnchorLine = function (index, doc) {
        // To ensure the anchor will not insert an extra empty line
        var startPosition = new vscode_1.Position(index, 0);
        if (this.configManager.options.ANCHOR_MODE.value === AnchorMode_1.AnchorMode.bitbucket) {
            if (index > 0 && doc.lineAt(index - 1).text.length === 0) {
                startPosition = new vscode_1.Position(index - 2, 0);
            }
        }
        return startPosition;
    };
    AutoMarkdownToc.prototype.createToc = function (editBuilder, headerList, insertPosition) {
        var _this = this;
        var text = [];
        //// TOC STAT: the custom option IS inside the toc start.
        text = text.concat(this.generateTocStartIndicator());
        //// HEADERS
        var minimumRenderedDepth = headerList[0].depth;
        headerList.forEach(function (header) {
            minimumRenderedDepth = Math.min(minimumRenderedDepth, header.depth);
        });
        var tocRows = [];
        headerList.forEach(function (header) {
            if (header.depth >= _this.configManager.options.DEPTH_FROM.value && !header.isIgnored) {
                var row = _this.generateTocRow(header, minimumRenderedDepth);
                tocRows.push(row);
            }
        });
        text.push(tocRows.join(this.configManager.options.lineEnding));
        //// TOC END
        text.push(this.configManager.options.lineEnding + "<!-- /TOC -->");
        // insert
        editBuilder.insert(insertPosition, text.join(this.configManager.options.lineEnding));
    };
    AutoMarkdownToc.prototype.generateTocRow = function (header, minimumRenderedDepth) {
        var row = [];
        // Indentation
        var indentRepeatTime = header.depth - Math.max(this.configManager.options.DEPTH_FROM.value, minimumRenderedDepth);
        row.push(this.configManager.options.tab.repeat(indentRepeatTime));
        row.push(this.configManager.options.BULLET_CHAR.value);
        row.push(' ');
        // TOC with or without link and order
        if (this.configManager.options.WITH_LINKS.value) {
            row.push(header.tocRowWithAnchor(this.getTocString(header)));
        }
        else {
            row.push(this.getTocString(header));
        }
        return row.join('');
    };
    AutoMarkdownToc.prototype.getTocString = function (header) {
        if (this.configManager.options.ORDERED_LIST.value) {
            return header.tocWithOrder;
        }
        else {
            return header.tocWithoutOrder;
        }
    };
    AutoMarkdownToc.prototype.generateTocStartIndicator = function () {
        var tocStartIndicator = [];
        tocStartIndicator.push('<!-- TOC ');
        this.generateCustomOptionsInTocStart(tocStartIndicator);
        tocStartIndicator.push('-->' + this.configManager.options.lineEnding);
        return tocStartIndicator.join('');
    };
    AutoMarkdownToc.prototype.generateCustomOptionsInTocStart = function (tocStartIndicator) {
        var _this = this;
        // custom options
        this.configManager.options.optionsFlag.forEach(function (optionKey) {
            if (_this.configManager.options.optionsFlag.indexOf(optionKey) !== -1) {
                tocStartIndicator.push(optionKey + ':' + _this.configManager.getOptionValueByKey(optionKey) + ' ');
            }
        });
    };
    AutoMarkdownToc.prototype.dispose = function () {
    };
    return AutoMarkdownToc;
}());
exports.AutoMarkdownToc = AutoMarkdownToc;
