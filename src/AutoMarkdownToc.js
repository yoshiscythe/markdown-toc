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
exports.AutoMarkdownToc = void 0;
const vscode_1 = require("vscode");
const ConfigManager_1 = require("./ConfigManager");
const HeaderManager_1 = require("./HeaderManager");
const AnchorMode_1 = require("./models/AnchorMode");
const RegexStrings_1 = require("./models/RegexStrings");
const Utilities_1 = require("./Utilities");
class AutoMarkdownToc {
    constructor() {
        this.configManager = new ConfigManager_1.ConfigManager();
        this.headerManager = new HeaderManager_1.HeaderManager(this.configManager);
    }
    onDidSaveTextDocument() {
        if (!this.configManager.options.UPDATE_ON_SAVE.value) {
            return;
        }
        // Prevent save loop
        if (this.configManager.options.isProgrammaticallySave) {
            this.configManager.options.isProgrammaticallySave = false;
            return;
        }
        let editor = vscode_1.window.activeTextEditor;
        if (editor !== undefined) {
            let doc = editor.document;
            if (doc.languageId !== 'markdown') {
                return;
            }
            let tocRange = this.getTocRange();
            if (!tocRange.isSingleLine) {
                this.updateMarkdownToc();
                this.configManager.options.isProgrammaticallySave = true;
                doc.save();
            }
        }
    }
    // onDidSaveTextDocumentをフォーク
    // save時にupdateLatestDiaryLinkをやってくれそう
    onDidSaveTextDocument4Diary() {
        if (!this.configManager.options.UPDATE_ON_SAVE.value) {
            return;
        }
        // Prevent save loop
        if (this.configManager.options.isProgrammaticallySave) {
            this.configManager.options.isProgrammaticallySave = false;
            return;
        }
        let editor = vscode_1.window.activeTextEditor;
        if (editor !== undefined) {
            let doc = editor.document;
            if (doc.languageId !== 'markdown') {
                return;
            }
            let tocRange = this.getTocRange();
            if (!tocRange.isSingleLine) {
                this.updateLatestDiaryLink();
                this.configManager.options.isProgrammaticallySave = true;
                doc.save();
            }
        }
    }
    updateMarkdownToc() {
        return __awaiter(this, void 0, void 0, function* () {
            let autoMarkdownToc = this;
            let editor = vscode_1.window.activeTextEditor;
            if (editor === undefined) {
                return;
            }
            autoMarkdownToc.configManager.updateOptions();
            let tocRange = autoMarkdownToc.getTocRange();
            let headerList = yield autoMarkdownToc.headerManager.getHeaderList();
            let document = editor.document;
            editor.edit((editBuilder) => __awaiter(this, void 0, void 0, function* () {
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
            }));
        });
    }
    // updateMarkdownTocが雛形
    updateLatestDiaryLink() {
        return __awaiter(this, void 0, void 0, function* () {
            let autoMarkdownToc = this;
            let editor = vscode_1.window.activeTextEditor;
            if (editor === undefined) {
                return;
            }
            autoMarkdownToc.configManager.updateOptions();
            let tocRange = autoMarkdownToc.getTocRange();
            let headerList = yield autoMarkdownToc.headerManager.getHeaderList();
            let document = editor.document;
            editor.edit((editBuilder) => __awaiter(this, void 0, void 0, function* () {
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
                // createToc->createLatestDiaryLinkへ変更
                autoMarkdownToc.createLatestDiaryLink(editBuilder, headerList, tocRange.start);
                autoMarkdownToc.insertAnchors(editBuilder, headerList);
            }));
        });
    }
    deleteMarkdownToc() {
        let autoMarkdownToc = this;
        let editor = vscode_1.window.activeTextEditor;
        if (editor === undefined) {
            return;
        }
        editor.edit(function (editBuilder) {
            let tocRange = autoMarkdownToc.getTocRange();
            if (tocRange.isSingleLine) {
                return;
            }
            editBuilder.delete(tocRange);
            autoMarkdownToc.deleteAnchors(editBuilder);
        });
    }
    updateHeadersWithSections(editBuilder, headerList, document) {
        headerList.forEach(header => {
            if (header.range.start.line !== 0 && !document.lineAt(header.range.start.line - 1).isEmptyOrWhitespace) {
                editBuilder.insert(new vscode_1.Position(header.range.start.line, 0), this.configManager.options.lineEnding);
            }
            if (this.configManager.options.ORDERED_LIST.value) {
                editBuilder.replace(header.range, header.fullHeaderWithOrder);
            }
            else {
                editBuilder.replace(header.range, header.fullHeaderWithoutOrder);
            }
        });
    }
    updateMarkdownSections() {
        return __awaiter(this, void 0, void 0, function* () {
            this.configManager.updateOptions();
            let headerList = yield this.headerManager.getHeaderList();
            let editor = vscode_1.window.activeTextEditor;
            let config = this.configManager;
            if (editor !== undefined) {
                config.options.isOrderedListDetected = true;
                let document = editor.document;
                editor.edit(editBuilder => {
                    this.updateHeadersWithSections(editBuilder, headerList, document);
                });
            }
        });
    }
    deleteMarkdownSections() {
        return __awaiter(this, void 0, void 0, function* () {
            this.configManager.updateOptions();
            let headerList = yield this.headerManager.getHeaderList();
            let editor = vscode_1.window.activeTextEditor;
            let config = this.configManager;
            if (editor !== undefined && headerList !== undefined) {
                config.options.isOrderedListDetected = false;
                editor.edit(function (editBuilder) {
                    headerList.forEach(element => {
                        editBuilder.replace(element.range, element.fullHeaderWithoutOrder);
                    });
                });
            }
        });
    }
    /**
     * Get TOC range, in case of no TOC, return the active line
     * In case of the editor is not available, return the first line
     */
    getTocRange() {
        let editor = vscode_1.window.activeTextEditor;
        if (editor === undefined) {
            return new vscode_1.Range(0, 0, 0, 0);
        }
        let doc = editor.document;
        let start, end;
        for (let index = 0; index < doc.lineCount; index++) {
            if (Utilities_1.Utilities.isLineStartOrEndOfCodeBlock(index, doc)) {
                index = Utilities_1.Utilities.getNextLineIndexIsNotInCode(index, doc);
            }
            let lineText = doc.lineAt(index).text;
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
    }
    /**
     * insert anchor for a header
     * @param editBuilder
     * @param header
     */
    insertAnchor(editBuilder, header) {
        let anchorMatches = header.tocRowWithAnchor(header.tocWithoutOrder).match(RegexStrings_1.RegexStrings.Instance.REGEXP_ANCHOR);
        if (anchorMatches !== null) {
            // let name = anchorMatches[1];
            let text = [
                this.configManager.options.lineEnding,
                '<a id="',
                header.anchor.id,
                '" name="',
                header.anchor.name,
                '"></a>'
            ];
            let insertPosition = new vscode_1.Position(header.range.end.line, header.range.end.character);
            if (this.configManager.options.ANCHOR_MODE.value === AnchorMode_1.AnchorMode.bitbucket) {
                text = text.slice(1);
                text.push(this.configManager.options.lineEnding);
                text.push(this.configManager.options.lineEnding);
                insertPosition = new vscode_1.Position(header.range.start.line, 0);
            }
            editBuilder.insert(insertPosition, text.join(''));
        }
    }
    insertAnchors(editBuilder, headerList) {
        if (!this.configManager.options.INSERT_ANCHOR.value) {
            return;
        }
        headerList.forEach(header => {
            this.insertAnchor(editBuilder, header);
        });
    }
    deleteAnchors(editBuilder) {
        let editor = vscode_1.window.activeTextEditor;
        if (editor !== undefined) {
            let doc = editor.document;
            for (let index = 0; index < doc.lineCount; index++) {
                let lineText = doc.lineAt(index).text;
                if (lineText.match(RegexStrings_1.RegexStrings.Instance.REGEXP_MARKDOWN_ANCHOR) === null) {
                    continue;
                }
                let startPosition = this.getStartPositionOfAnchorLine(index, doc);
                let range = new vscode_1.Range(startPosition, new vscode_1.Position(startPosition.line + 1, 0));
                editBuilder.delete(range);
            }
        }
    }
    getStartPositionOfAnchorLine(index, doc) {
        // To ensure the anchor will not insert an extra empty line
        let startPosition = new vscode_1.Position(index, 0);
        if (this.configManager.options.ANCHOR_MODE.value === AnchorMode_1.AnchorMode.bitbucket) {
            if (index > 0 && doc.lineAt(index - 1).text.length === 0) {
                startPosition = new vscode_1.Position(index - 2, 0);
            }
        }
        return startPosition;
    }
    createToc(editBuilder, headerList, insertPosition) {
        let text = [];
        //// TOC STAT: the custom option IS inside the toc start.
        text = text.concat(this.generateTocStartIndicator());
        //// HEADERS
        let minimumRenderedDepth = headerList[0].depth;
        headerList.forEach(header => {
            minimumRenderedDepth = Math.min(minimumRenderedDepth, header.depth);
        });
        let tocRows = [];
        headerList.forEach(header => {
            if (header.depth >= this.configManager.options.DEPTH_FROM.value && !header.isIgnored) {
                let row = this.generateTocRow(header, minimumRenderedDepth);
                tocRows.push(row);
            }
        });
        text.push(tocRows.join(this.configManager.options.lineEnding));
        //// TOC END
        text.push(this.configManager.options.lineEnding + "<!-- /TOC -->");
        // insert
        editBuilder.insert(insertPosition, text.join(this.configManager.options.lineEnding));
    }
    // createTocが雛形
    createLatestDiaryLink(editBuilder, headerList, insertPosition) {
        let text = [];
        //// TOC STAT: the custom option IS inside the toc start.
        text = text.concat(this.generateTocStartIndicator());
        //// HEADERS
        let minimumRenderedDepth = headerList[0].depth;
        headerList.forEach(header => {
            minimumRenderedDepth = Math.min(minimumRenderedDepth, header.depth);
        });
        let tocRows = [];
        let sentinel = this.configManager.options.SENTINEL_HEADING.value;
        let beforeHeadingSentinel = this.getBeforeHeadingSentinel(headerList, sentinel);
        // forEachはArrayのメソッド．与えられた関数を、配列の各要素に対して一度ずつ実行
        headerList.forEach(header => {
            if (header == beforeHeadingSentinel && !header.isIgnored) {
                let row = this.generateTocRow(header, minimumRenderedDepth);
                tocRows.push(row);
            }
        });
        text.push(tocRows.join(this.configManager.options.lineEnding));
        //// TOC END
        text.push(this.configManager.options.lineEnding + "<!-- /TOC -->");
        // insert
        editBuilder.insert(insertPosition, text.join(this.configManager.options.lineEnding));
    }
    getBeforeHeadingSentinel(headerList, sentinel) {
        let sentinelIndex = 0;
        for (let index = 0; index < headerList.length; index++) {
            let header = headerList[index];
            if (header.tocWithOrder == sentinel) {
                sentinelIndex = index;
                break;
            }
        }
        let beforeHeadingSentinel = headerList[sentinelIndex];
        return beforeHeadingSentinel;
    }
    generateTocRow(header, minimumRenderedDepth) {
        let row = [];
        // Indentation
        let indentRepeatTime = header.depth - Math.max(this.configManager.options.DEPTH_FROM.value, minimumRenderedDepth);
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
    }
    getTocString(header) {
        if (this.configManager.options.ORDERED_LIST.value) {
            return header.tocWithOrder;
        }
        else {
            return header.tocWithoutOrder;
        }
    }
    generateTocStartIndicator() {
        let tocStartIndicator = [];
        tocStartIndicator.push('<!-- TOC ');
        this.generateCustomOptionsInTocStart(tocStartIndicator);
        tocStartIndicator.push('-->' + this.configManager.options.lineEnding);
        return tocStartIndicator.join('');
    }
    generateCustomOptionsInTocStart(tocStartIndicator) {
        // custom options
        this.configManager.options.optionsFlag.forEach(optionKey => {
            if (this.configManager.options.optionsFlag.indexOf(optionKey) !== -1) {
                tocStartIndicator.push(optionKey + ':' + this.configManager.getOptionValueByKey(optionKey) + ' ');
            }
        });
    }
    dispose() {
    }
}
exports.AutoMarkdownToc = AutoMarkdownToc;
//# sourceMappingURL=AutoMarkdownToc.js.map