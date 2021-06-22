"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
var RegexStrings_1 = require("./models/RegexStrings");
var Options_1 = require("./models/Options");
var vscode_1 = require("vscode");
var ConfigManager = /** @class */ (function () {
    function ConfigManager() {
        this.options = new Options_1.Options();
    }
    ConfigManager.prototype.updateOptions = function () {
        this.loadConfigurations();
        this.loadCustomOptions();
    };
    ConfigManager.prototype.loadConfigurations = function () {
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
    };
    /**
     * DEPRECATED
     * use single line unique options instead
     */
    ConfigManager.prototype.loadCustomOptions = function () {
        var _this = this;
        this.options.optionsFlag = [];
        var editor = vscode_1.window.activeTextEditor;
        if (editor === undefined) {
            return;
        }
        for (var index = 0; index < editor.document.lineCount; index++) {
            var lineText = editor.document.lineAt(index).text;
            if (lineText.match(RegexStrings_1.RegexStrings.Instance.REGEXP_TOC_START)) {
                var options = lineText.match(RegexStrings_1.RegexStrings.Instance.REGEXP_TOC_CONFIG);
                if (options !== null) {
                    options.forEach(function (element) {
                        var pair = RegexStrings_1.RegexStrings.Instance.REGEXP_TOC_CONFIG_ITEM.exec(element);
                        if (pair !== null) {
                            var key = pair[1].toLocaleLowerCase();
                            var value = pair[2];
                            switch (key) {
                                case _this.options.DEPTH_FROM.lowerCaseKey:
                                    _this.options.optionsFlag.push(key);
                                    _this.options.DEPTH_FROM.uniqueValue = _this.parseValidNumber(value);
                                    break;
                                case _this.options.DEPTH_TO.lowerCaseKey:
                                    _this.options.optionsFlag.push(key);
                                    _this.options.DEPTH_TO.uniqueValue = Math.max(_this.parseValidNumber(value), _this.options.DEPTH_FROM.value);
                                    break;
                                case _this.options.INSERT_ANCHOR.lowerCaseKey:
                                    _this.options.optionsFlag.push(key);
                                    _this.options.INSERT_ANCHOR.uniqueValue = _this.parseBool(value);
                                    break;
                                case _this.options.WITH_LINKS.lowerCaseKey:
                                    _this.options.optionsFlag.push(key);
                                    _this.options.WITH_LINKS.uniqueValue = _this.parseBool(value);
                                    break;
                                case _this.options.ORDERED_LIST.lowerCaseKey:
                                    _this.options.optionsFlag.push(key);
                                    _this.options.ORDERED_LIST.uniqueValue = _this.parseBool(value);
                                    break;
                                case _this.options.UPDATE_ON_SAVE.lowerCaseKey:
                                    _this.options.optionsFlag.push(key);
                                    _this.options.UPDATE_ON_SAVE.uniqueValue = _this.parseBool(value);
                                    break;
                                case _this.options.ANCHOR_MODE.lowerCaseKey:
                                    _this.options.optionsFlag.push(key);
                                    _this.options.ANCHOR_MODE.uniqueValue = value;
                                    break;
                                case _this.options.BULLET_CHAR.lowerCaseKey:
                                    _this.options.optionsFlag.push(key);
                                    _this.options.BULLET_CHAR.uniqueValue = value;
                                    break;
                                case _this.options.DETECT_AUTO_SET_SECTION.lowerCaseKey:
                                    _this.options.optionsFlag.push(key);
                                    _this.options.DETECT_AUTO_SET_SECTION.uniqueValue = value;
                                    break;
                                case _this.options.SENTINEL_HEADING.lowerCaseKey:
                                    _this.options.optionsFlag.push(key);
                                    _this.options.SENTINEL_HEADING.uniqueValue = value;
                                    break;
                            }
                        }
                    });
                }
                break;
            }
        }
        return;
    };
    ConfigManager.prototype.getOptionValueByKey = function (key) {
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
    };
    ConfigManager.prototype.parseBool = function (value) {
        return value.toLocaleLowerCase() === 'true';
    };
    ConfigManager.prototype.parseValidNumber = function (value) {
        var num = parseInt(value);
        if (num < 1) {
            return 1;
        }
        return num;
    };
    return ConfigManager;
}());
exports.ConfigManager = ConfigManager;
