"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const RegexStrings_1 = require("./models/RegexStrings");
const Options_1 = require("./models/Options");
const vscode_1 = require("vscode");
class ConfigManager {
    constructor() {
        this.options = new Options_1.Options();
    }
    updateOptions() {
        this.loadConfigurations();
        this.loadCustomOptions();
    }
    loadConfigurations() {
        this.options.DEPTH_FROM.workspaceValue = vscode_1.workspace.getConfiguration(this.options.extensionName).get(this.options.DEPTH_FROM.key);
        this.options.DEPTH_TO.workspaceValue = vscode_1.workspace.getConfiguration(this.options.extensionName).get(this.options.DEPTH_TO.key);
        this.options.INSERT_ANCHOR.workspaceValue = vscode_1.workspace.getConfiguration(this.options.extensionName).get(this.options.INSERT_ANCHOR.key);
        this.options.WITH_LINKS.workspaceValue = vscode_1.workspace.getConfiguration(this.options.extensionName).get(this.options.WITH_LINKS.key);
        this.options.ORDERED_LIST.workspaceValue = vscode_1.workspace.getConfiguration(this.options.extensionName).get(this.options.ORDERED_LIST.key);
        this.options.UPDATE_ON_SAVE.workspaceValue = vscode_1.workspace.getConfiguration(this.options.extensionName).get(this.options.UPDATE_ON_SAVE.key);
        this.options.ANCHOR_MODE.workspaceValue = vscode_1.workspace.getConfiguration(this.options.extensionName).get(this.options.ANCHOR_MODE.key);
        this.options.BULLET_CHAR.workspaceValue = vscode_1.workspace.getConfiguration(this.options.extensionName).get(this.options.BULLET_CHAR.key);
        this.options.DETECT_AUTO_SET_SECTION.workspaceValue = vscode_1.workspace.getConfiguration(this.options.extensionName).get(this.options.DETECT_AUTO_SET_SECTION.key);
        this.options.SENTINEL_HEADING.workspaceValue = vscode_1.workspace.getConfiguration(this.options.extensionName).get(this.options.SENTINEL_HEADING.key);
        this.options.lineEnding = vscode_1.workspace.getConfiguration("files", null).get("eol");
        if (this.options.lineEnding === 'auto') {
            this.options.lineEnding = this.options.EOL;
        }
        this.options.tabSize = vscode_1.workspace.getConfiguration("[markdown]", null)["editor.tabSize"];
        if (this.options.tabSize === undefined || this.options.tabSize === null) {
            this.options.tabSize = vscode_1.workspace.getConfiguration("editor", null).get("tabSize");
        }
        this.options.insertSpaces = vscode_1.workspace.getConfiguration("[markdown]", null)["editor.insertSpaces"];
        if (this.options.insertSpaces === undefined || this.options.insertSpaces === null) {
            this.options.insertSpaces = vscode_1.workspace.getConfiguration("editor", null).get("insertSpaces");
        }
        if (this.options.insertSpaces && this.options.tabSize > 0) {
            this.options.tab = " ".repeat(this.options.tabSize);
        }
        if (vscode_1.workspace.getConfiguration("files", null).get("autoSave") !== "off") {
            this.options.autoSave = true;
        }
    }
    /**
     * DEPRECATED
     * use single line unique options instead
     */
    loadCustomOptions() {
        this.options.optionsFlag = [];
        let editor = vscode_1.window.activeTextEditor;
        if (editor === undefined) {
            return;
        }
        for (let index = 0; index < editor.document.lineCount; index++) {
            let lineText = editor.document.lineAt(index).text;
            if (lineText.match(RegexStrings_1.RegexStrings.Instance.REGEXP_TOC_START)) {
                let options = lineText.match(RegexStrings_1.RegexStrings.Instance.REGEXP_TOC_CONFIG);
                if (options !== null) {
                    options.forEach(element => {
                        let pair = RegexStrings_1.RegexStrings.Instance.REGEXP_TOC_CONFIG_ITEM.exec(element);
                        if (pair !== null) {
                            let key = pair[1].toLocaleLowerCase();
                            let value = pair[2];
                            switch (key) {
                                case this.options.DEPTH_FROM.lowerCaseKey:
                                    this.options.optionsFlag.push(key);
                                    this.options.DEPTH_FROM.uniqueValue = this.parseValidNumber(value);
                                    break;
                                case this.options.DEPTH_TO.lowerCaseKey:
                                    this.options.optionsFlag.push(key);
                                    this.options.DEPTH_TO.uniqueValue = Math.max(this.parseValidNumber(value), this.options.DEPTH_FROM.value);
                                    break;
                                case this.options.INSERT_ANCHOR.lowerCaseKey:
                                    this.options.optionsFlag.push(key);
                                    this.options.INSERT_ANCHOR.uniqueValue = this.parseBool(value);
                                    break;
                                case this.options.WITH_LINKS.lowerCaseKey:
                                    this.options.optionsFlag.push(key);
                                    this.options.WITH_LINKS.uniqueValue = this.parseBool(value);
                                    break;
                                case this.options.ORDERED_LIST.lowerCaseKey:
                                    this.options.optionsFlag.push(key);
                                    this.options.ORDERED_LIST.uniqueValue = this.parseBool(value);
                                    break;
                                case this.options.UPDATE_ON_SAVE.lowerCaseKey:
                                    this.options.optionsFlag.push(key);
                                    this.options.UPDATE_ON_SAVE.uniqueValue = this.parseBool(value);
                                    break;
                                case this.options.ANCHOR_MODE.lowerCaseKey:
                                    this.options.optionsFlag.push(key);
                                    this.options.ANCHOR_MODE.uniqueValue = value;
                                    break;
                                case this.options.BULLET_CHAR.lowerCaseKey:
                                    this.options.optionsFlag.push(key);
                                    this.options.BULLET_CHAR.uniqueValue = value;
                                    break;
                                case this.options.DETECT_AUTO_SET_SECTION.lowerCaseKey:
                                    this.options.optionsFlag.push(key);
                                    this.options.DETECT_AUTO_SET_SECTION.uniqueValue = value;
                                    break;
                                case this.options.SENTINEL_HEADING.lowerCaseKey:
                                    this.options.optionsFlag.push(key);
                                    this.options.SENTINEL_HEADING.uniqueValue = value;
                                    break;
                            }
                        }
                    });
                }
                break;
            }
        }
        return;
    }
    getOptionValueByKey(key) {
        switch (key.toLowerCase()) {
            case this.options.DEPTH_FROM.lowerCaseKey:
                return this.options.DEPTH_FROM.value;
            case this.options.DEPTH_TO.lowerCaseKey:
                return this.options.DEPTH_TO.value;
            case this.options.INSERT_ANCHOR.lowerCaseKey:
                return this.options.INSERT_ANCHOR.value;
            case this.options.WITH_LINKS.lowerCaseKey:
                return this.options.WITH_LINKS.value;
            case this.options.ORDERED_LIST.lowerCaseKey:
                return this.options.ORDERED_LIST.value;
            case this.options.UPDATE_ON_SAVE.lowerCaseKey:
                return this.options.UPDATE_ON_SAVE.value;
            case this.options.ANCHOR_MODE.lowerCaseKey:
                return this.options.ANCHOR_MODE.value;
            case this.options.BULLET_CHAR.lowerCaseKey:
                return this.options.BULLET_CHAR.value;
            case this.options.DETECT_AUTO_SET_SECTION.lowerCaseKey:
                return this.options.DETECT_AUTO_SET_SECTION.value;
            case this.options.SENTINEL_HEADING.lowerCaseKey:
                return this.options.SENTINEL_HEADING.value;
        }
    }
    parseBool(value) {
        return value.toLocaleLowerCase() === 'true';
    }
    parseValidNumber(value) {
        let num = parseInt(value);
        if (num < 1) {
            return 1;
        }
        return num;
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=ConfigManager.js.map