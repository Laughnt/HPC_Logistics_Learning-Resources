/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => TagRenderer
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var import_language = require("@codemirror/language");
var import_state = require("@codemirror/state");
var import_view = require("@codemirror/view");
var import_obsidian2 = require("obsidian");
var BASETAG = "basename-tag";
var getVaultName = () => window.app.vault.getName();
var createTagNode = (text, readingMode) => {
  const node = document.createElement("a");
  if (!text)
    return node;
  node.className = `tag ${BASETAG}`;
  node.target = "_blank";
  node.rel = "noopener";
  node.href = readingMode ? `${text}` : `#${text}`;
  const vaultStr = encodeURIComponent(getVaultName());
  const queryStr = `tag:${encodeURIComponent(text)}`;
  node.dataset.uri = `obsidian://search?vault=${vaultStr}&query=${queryStr}`;
  node.textContent = text.slice(text.lastIndexOf("/") + 1).replaceAll("#", "");
  node.onclick = () => window.open(node.dataset.uri);
  return node;
};
var TagWidget = class extends import_view.WidgetType {
  constructor(text, readingMode) {
    super();
    this.text = text;
    this.readingMode = readingMode;
  }
  toDOM(view) {
    return createTagNode(this.text, this.readingMode);
  }
};
var editorPlugin = class {
  constructor(view) {
    this.decorations = this.buildDecorations(view);
  }
  update(update) {
    var _a;
    if (update.view.composing || ((_a = update.view.plugin(import_obsidian2.livePreviewState)) == null ? void 0 : _a.mousedown)) {
      this.decorations = this.decorations.map(update.changes);
    } else if (update.selectionSet || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    }
  }
  buildDecorations(view) {
    const builder = new import_state.RangeSetBuilder();
    for (const { from, to } of view.visibleRanges) {
      (0, import_language.syntaxTree)(view.state).iterate({
        from,
        to,
        enter: (node) => {
          var _a;
          if (node.name.contains("hashtag-end")) {
            const extendedFrom = node.from - 1;
            const extendedTo = node.to + 1;
            for (const range of view.state.selection.ranges) {
              if (extendedFrom <= range.to && range.from < extendedTo) {
                return;
              }
            }
            const text = view.state.sliceDoc(node.from, node.to);
            builder.add(node.from - 1, node.to, import_view.Decoration.replace({
              widget: new TagWidget(text, false)
            }));
          }
          if (node.name === "hmd-frontmatter") {
            const extendedFrom = node.from;
            const extendedTo = node.to + 1;
            for (const range of view.state.selection.ranges) {
              if (extendedFrom <= range.to && range.from < extendedTo) {
                return;
              }
            }
            let frontmatterName = "";
            let currentNode = node.node;
            for (let i = 0; i < 20; i++) {
              currentNode = (_a = currentNode.prevSibling) != null ? _a : node.node;
              if (currentNode == null ? void 0 : currentNode.name.contains("atom")) {
                frontmatterName = view.state.sliceDoc(currentNode.from, currentNode.to);
                break;
              }
            }
            if (frontmatterName.toLowerCase() !== "tags" && frontmatterName.toLowerCase() !== "tag")
              return;
            const contentNode = node.node;
            const content = view.state.sliceDoc(contentNode.from, contentNode.to);
            const tagsArray = content.split(" ").filter((tag) => tag !== "");
            let currentIndex = contentNode.from;
            for (let i = 0; i < tagsArray.length; i++) {
              builder.add(currentIndex, currentIndex + tagsArray[i].length, import_view.Decoration.replace({
                widget: new TagWidget(tagsArray[i], false)
              }));
              currentIndex += tagsArray[i].length + 1;
            }
          }
        }
      });
    }
    return builder.finish();
  }
};
var rerenderProperty = () => {
  document.querySelectorAll(`[data-property-key="tags"] .multi-select-pill-content span:not(.${BASETAG})`).forEach((node) => {
    var _a;
    const text = (_a = node.textContent) != null ? _a : "";
    node.textContent = text.slice(text.lastIndexOf("/") + 1);
    node.className = BASETAG;
    node.dataset.tag = text;
  });
};
var TagRenderer = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTING;
  }
  async onload() {
    this.loadSettings();
    this.registerEditorExtension(import_view.ViewPlugin.fromClass(editorPlugin, {
      decorations: (value) => this.settings.renderOnEditor ? value.decorations : new import_state.RangeSetBuilder().finish()
    }));
    this.registerMarkdownPostProcessor((el) => {
      el.querySelectorAll(`a.tag:not(.${BASETAG})`).forEach((node) => {
        var _a;
        node.removeAttribute("class");
        node.style.display = "none";
        (_a = node.parentNode) == null ? void 0 : _a.insertBefore(createTagNode(node.textContent, true), node);
      });
    });
    this.registerEvent(this.app.workspace.on("layout-change", rerenderProperty));
    this.registerEvent(this.app.workspace.on("file-open", rerenderProperty));
    this.addSettingTab(new SettingTab(this.app, this));
  }
  async loadSettings() {
    this.settings = Object.assign(DEFAULT_SETTING, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var DEFAULT_SETTING = {
  renderOnEditor: true
};
var SettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.app = app;
    this.plugin = plugin;
  }
  async display() {
    const { settings: setting } = this.plugin;
    const { containerEl } = this;
    containerEl.empty();
    const editorSetting = new import_obsidian.Setting(containerEl);
    editorSetting.setName("Render on Editor").setDesc("Render basetags also on editor.").addToggle((toggle) => {
      toggle.setValue(setting.renderOnEditor);
      toggle.onChange(async (value) => {
        setting.renderOnEditor = value;
        await this.plugin.saveSettings();
      });
    });
  }
};
