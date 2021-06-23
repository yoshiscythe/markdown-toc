import {
    commands,
    ExtensionContext,
    workspace
} from 'vscode';

import { AutoMarkdownToc } from './AutoMarkdownToc';

export function activate(context: ExtensionContext) {

    // create a AutoMarkdownToc
    let autoMarkdownToc = new AutoMarkdownToc();

    // コマンドの中身をautoMarkdownTocから参照してる
    let updateLatestDiaryLink = commands.registerCommand('extension.updateLatestDiaryLink', async () => { await autoMarkdownToc.updateLatestDiaryLink(); });
    let updateMarkdownToc = commands.registerCommand('extension.updateMarkdownToc', async () => { await autoMarkdownToc.updateMarkdownToc(); });
    let deleteMarkdownToc = commands.registerCommand('extension.deleteMarkdownToc', () => { autoMarkdownToc.deleteMarkdownToc(); });
    let updateMarkdownSections = commands.registerCommand('extension.updateMarkdownSections', () => { autoMarkdownToc.updateMarkdownSections(); });
    let deleteMarkdownSections = commands.registerCommand('extension.deleteMarkdownSections', () => { autoMarkdownToc.deleteMarkdownSections(); });

    // Events
    // let saveMarkdownToc = workspace.onDidSaveTextDocument(() => { autoMarkdownToc.onDidSaveTextDocument(); });
    let saveLatestDiaryLink = workspace.onDidSaveTextDocument(() => { autoMarkdownToc.onDidSaveTextDocument4Diary(); });

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(updateLatestDiaryLink);
    context.subscriptions.push(updateMarkdownToc);
    context.subscriptions.push(deleteMarkdownToc);
    context.subscriptions.push(updateMarkdownSections);
    context.subscriptions.push(deleteMarkdownSections);

    context.subscriptions.push(saveLatestDiaryLink);
    // context.subscriptions.push(saveMarkdownToc);
}

// this method is called when your extension is deactivated
export function deactivate() { }