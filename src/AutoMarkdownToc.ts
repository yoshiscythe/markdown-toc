import {
    window,
    Position,
    Range,
    TextEditorEdit,
    TextDocument
} from 'vscode';
import { Header } from "./models/Header";
import { ConfigManager } from './ConfigManager';
import { HeaderManager } from './HeaderManager';
import { AnchorMode } from './models/AnchorMode';
import { RegexStrings } from './models/RegexStrings';
import { Utilities } from './Utilities';

export class AutoMarkdownToc {

    configManager = new ConfigManager();
    headerManager = new HeaderManager(this.configManager);

    public onDidSaveTextDocument() {
        if (!this.configManager.options.UPDATE_ON_SAVE.value) {
            return;
        }

        // Prevent save loop
        if (this.configManager.options.isProgrammaticallySave) {
            this.configManager.options.isProgrammaticallySave = false;
            return;
        }

        let editor = window.activeTextEditor;
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
    public onWillSaveTextDocument4Diary() {
        if (!this.configManager.options.UPDATE_ON_SAVE.value) {
            return;
        }

        // Prevent save loop
        if (this.configManager.options.isProgrammaticallySave) {
            this.configManager.options.isProgrammaticallySave = false;
            return;
        }

        let editor = window.activeTextEditor;
        if (editor !== undefined) {
            let doc = editor.document;

            if (doc.languageId !== 'markdown') {
                return;
            }

            let tocRange = this.getTocRange();

            if (!tocRange.isSingleLine) {
                this.updateLatestDiaryLink().then(()=>{doc.save();});
                this.configManager.options.isProgrammaticallySave = true;
            }
        }
    }

    public async updateMarkdownToc() {
        let autoMarkdownToc = this;
        let editor = window.activeTextEditor;

        // console.log("DoTOC");

        if (editor === undefined) {
            return;
        }

        autoMarkdownToc.configManager.updateOptions();
        let tocRange = autoMarkdownToc.getTocRange();
        let headerList = await autoMarkdownToc.headerManager.getHeaderList();
        let document = editor.document;

        editor.edit(async editBuilder => {
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
        });
    }

    // updateMarkdownTocが雛形
    public async updateLatestDiaryLink() {
        let autoMarkdownToc = this;
        let editor = window.activeTextEditor;

        if (editor === undefined) {
            return;
        }

        autoMarkdownToc.configManager.updateOptions();
        let tocRange = autoMarkdownToc.getTocRange();
        let headerList = await autoMarkdownToc.headerManager.getHeaderList();
        let document = editor.document;

        editor.edit(async editBuilder => {
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
        });
    }

    public deleteMarkdownToc() {
        let autoMarkdownToc = this;
        let editor = window.activeTextEditor;

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

    public updateHeadersWithSections(editBuilder: TextEditorEdit, headerList: Header[], document: TextDocument) {
        headerList.forEach(header => {

            if (header.range.start.line !== 0 && !document.lineAt(header.range.start.line - 1).isEmptyOrWhitespace) {
                editBuilder.insert(new Position(header.range.start.line, 0), this.configManager.options.lineEnding);
            }

            if (this.configManager.options.ORDERED_LIST.value) {
                editBuilder.replace(header.range, header.fullHeaderWithOrder);
            } else {
                editBuilder.replace(header.range, header.fullHeaderWithoutOrder);
            }
        });
    }

    public async updateMarkdownSections() {
        this.configManager.updateOptions();

        let headerList = await this.headerManager.getHeaderList();
        let editor = window.activeTextEditor;
        let config = this.configManager;

        if (editor !== undefined) {
            config.options.isOrderedListDetected = true;
            let document = editor.document;
            editor.edit(editBuilder => {
                this.updateHeadersWithSections(editBuilder, headerList, document);
            });
        }
    }

    public async deleteMarkdownSections() {
        this.configManager.updateOptions();
        let headerList = await this.headerManager.getHeaderList();
        let editor = window.activeTextEditor;
        let config = this.configManager;

        if (editor !== undefined && headerList !== undefined) {
            config.options.isOrderedListDetected = false;
            editor.edit(function (editBuilder) {
                headerList.forEach(element => {
                    editBuilder.replace(element.range, element.fullHeaderWithoutOrder);
                });
            });
        }
    }

    /**
     * Get TOC range, in case of no TOC, return the active line
     * In case of the editor is not available, return the first line
     */
    private getTocRange() {
        let editor = window.activeTextEditor;

        if (editor === undefined) {
            return new Range(0, 0, 0, 0);
        }

        let doc = editor.document;
        let start, end: Position | undefined;

        for (let index = 0; index < doc.lineCount; index++) {

            if (Utilities.isLineStartOrEndOfCodeBlock(index, doc)) {
                index = Utilities.getNextLineIndexIsNotInCode(index, doc);
            }

            let lineText = doc.lineAt(index).text;

            if ((start === undefined) && (lineText.match(RegexStrings.Instance.REGEXP_TOC_START) && !lineText.match(RegexStrings.Instance.REGEXP_IGNORE_TITLE))) {
                start = new Position(index, 0);
            }
            else if (lineText.match(RegexStrings.Instance.REGEXP_TOC_STOP)) {
                end = new Position(index, lineText.length);
                break;
            }
        }

        if ((start === undefined) || (end === undefined)) {
            if (start !== undefined) {
                end = start;
            } else if (end !== undefined) {
                start = end;
            } else {
                start = editor.selection.active;
                end = editor.selection.active;
            }
        }

        return new Range(start, end);
    }

    /**
     * insert anchor for a header
     * @param editBuilder
     * @param header
     */
    private insertAnchor(editBuilder: TextEditorEdit, header: Header) {
        let anchorMatches = header.tocRowWithAnchor(header.tocWithoutOrder).match(RegexStrings.Instance.REGEXP_ANCHOR);
        if (anchorMatches !== null) {
            // let name = anchorMatches[1];
            let text = [
                this.configManager.options.lineEnding,
                '<a id="',
                header.anchor.id,
                '" name="',
                header.anchor.name,
                '"></a>'];

            let insertPosition = new Position(header.range.end.line, header.range.end.character);

            if (this.configManager.options.ANCHOR_MODE.value === AnchorMode.bitbucket) {
                text = text.slice(1);
                text.push(this.configManager.options.lineEnding);
                text.push(this.configManager.options.lineEnding);
                insertPosition = new Position(header.range.start.line, 0);
            }

            editBuilder.insert(insertPosition, text.join(''));
        }
    }

    private insertAnchors(editBuilder: TextEditorEdit, headerList: Header[]) {
        if (!this.configManager.options.INSERT_ANCHOR.value) {
            return;
        }

        headerList.forEach(header => {
            this.insertAnchor(editBuilder, header);
        });
    }

    private deleteAnchors(editBuilder: TextEditorEdit) {
        let editor = window.activeTextEditor;
        if (editor !== undefined) {
            let doc = editor.document;
            for (let index = 0; index < doc.lineCount; index++) {
                let lineText = doc.lineAt(index).text;
                if (lineText.match(RegexStrings.Instance.REGEXP_MARKDOWN_ANCHOR) === null) {
                    continue;
                }

                let startPosition = this.getStartPositionOfAnchorLine(index, doc);

                let range = new Range(startPosition, new Position(startPosition.line + 1, 0));
                editBuilder.delete(range);
            }
        }
    }

    private getStartPositionOfAnchorLine(index: number, doc: TextDocument) {
        // To ensure the anchor will not insert an extra empty line
        let startPosition = new Position(index, 0);

        if (this.configManager.options.ANCHOR_MODE.value === AnchorMode.bitbucket) {
            if (index > 0 && doc.lineAt(index - 1).text.length === 0) {
                startPosition = new Position(index - 2, 0);
            }
        }

        return startPosition;
    }

    private createToc(editBuilder: TextEditorEdit, headerList: Header[], insertPosition: Position) {
        // console.log("createTOC");

        let text: string[] = [];

        //// TOC STAT: the custom option IS inside the toc start.
        text = text.concat(this.generateTocStartIndicator());

        //// HEADERS
        let minimumRenderedDepth = headerList[0].depth;
        headerList.forEach(header => {
            minimumRenderedDepth = Math.min(minimumRenderedDepth, header.depth);
        });

        let tocRows: string[] = [];

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
    private createLatestDiaryLink(editBuilder: TextEditorEdit, headerList: Header[], insertPosition: Position) {
        // console.log("createDiaryLink");

        let text: string[] = [];

        //// TOC STAT: the custom option IS inside the toc start.
        text = text.concat(this.generateTocStartIndicator());

        //// HEADERS
        let minimumRenderedDepth = headerList[0].depth;
        headerList.forEach(header => {
            minimumRenderedDepth = Math.min(minimumRenderedDepth, header.depth);
        });

        let tocRows: string[] = [];

        let sentinel: string = this.configManager.options.SENTINEL_HEADING.value;
        let beforeHeadingSentinel: Header = this.getBeforeHeadingSentinel(headerList, sentinel);

        // デバッグ用
        // console.log(beforeHeadingSentinel);
        // console.log(beforeHeadingSentinel.tocWithoutOrder);

        // デバッグ用
        // let message: string = "header before sentinel is: " + beforeHeadingSentinel.tocWithOrder + ", sentinel is: " + sentinel;
        // window.showInformationMessage(message);

        // forEachはArrayのメソッド．与えられた関数を、配列の各要素に対して一度ずつ実行
        headerList.forEach(header => {
            if (header === beforeHeadingSentinel && !header.isIgnored) {
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

    private getBeforeHeadingSentinel(headerList: Header[], sentinel: string) {
        let sentinelIndex = 0;
        for (let index = 0; index < headerList.length; index++) {
            let header = headerList[index];

            if (header.tocWithoutOrder === sentinel) {
                sentinelIndex = index;
                break;
            }
        }

        let beforeHeadingSentinel: Header = headerList[sentinelIndex-1];

        return beforeHeadingSentinel
    }

    private generateTocRow(header: Header, minimumRenderedDepth: number) {
        let row: string[] = [];

        // Indentation
        let indentRepeatTime = header.depth - Math.max(this.configManager.options.DEPTH_FROM.value, minimumRenderedDepth);
        row.push(this.configManager.options.tab.repeat(indentRepeatTime));

        row.push(this.configManager.options.BULLET_CHAR.value);

        row.push(' ');

        // TOC with or without link and order
        if (this.configManager.options.WITH_LINKS.value) {
            row.push(header.tocRowWithAnchor(this.getTocString(header)));
        } else {
            row.push(this.getTocString(header));
        }

        return row.join('');
    }

    private getTocString(header: Header) {
        if (this.configManager.options.ORDERED_LIST.value) {
            return header.tocWithOrder;
        } else {
            return header.tocWithoutOrder;
        }
    }

    private generateTocStartIndicator() {
        let tocStartIndicator: string[] = [];

        tocStartIndicator.push('<!-- TOC ');

        this.generateCustomOptionsInTocStart(tocStartIndicator);

        tocStartIndicator.push('-->' + this.configManager.options.lineEnding);

        return tocStartIndicator.join('');
    }

    private generateCustomOptionsInTocStart(tocStartIndicator: string[]) {
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