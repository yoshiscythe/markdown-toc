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
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const AutoMarkdownToc_1 = require("./AutoMarkdownToc");
function activate(context) {
    // create a AutoMarkdownToc
    let autoMarkdownToc = new AutoMarkdownToc_1.AutoMarkdownToc();
    // コマンドの中身をautoMarkdownTocから参照してる
    let updateLatestDiaryLink = vscode_1.commands.registerCommand('extension.updateLatestDiaryLink', () => __awaiter(this, void 0, void 0, function* () { yield autoMarkdownToc.updateLatestDiaryLink(); }));
    let updateMarkdownToc = vscode_1.commands.registerCommand('extension.updateMarkdownToc', () => __awaiter(this, void 0, void 0, function* () { yield autoMarkdownToc.updateMarkdownToc(); }));
    let deleteMarkdownToc = vscode_1.commands.registerCommand('extension.deleteMarkdownToc', () => { autoMarkdownToc.deleteMarkdownToc(); });
    let updateMarkdownSections = vscode_1.commands.registerCommand('extension.updateMarkdownSections', () => { autoMarkdownToc.updateMarkdownSections(); });
    let deleteMarkdownSections = vscode_1.commands.registerCommand('extension.deleteMarkdownSections', () => { autoMarkdownToc.deleteMarkdownSections(); });
    // Events
    let saveMarkdownToc = vscode_1.workspace.onDidSaveTextDocument(() => { autoMarkdownToc.onDidSaveTextDocument(); });
    let saveLatestDiaryLink = vscode_1.workspace.onDidSaveTextDocument(() => { autoMarkdownToc.onDidSaveTextDocument4Diary(); });
    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(updateLatestDiaryLink);
    context.subscriptions.push(updateMarkdownToc);
    context.subscriptions.push(deleteMarkdownToc);
    context.subscriptions.push(updateMarkdownSections);
    context.subscriptions.push(deleteMarkdownSections);
    context.subscriptions.push(saveLatestDiaryLink);
    context.subscriptions.push(saveMarkdownToc);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map