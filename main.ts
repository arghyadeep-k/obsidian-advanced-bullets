import { Plugin, MarkdownView, EditorChange } from 'obsidian';

interface CustomBulletsSettings {
  level1: string;
  level2: string;
  level3: string;
  level4: string;
  level5: string;
  enabled: boolean;
}

const DEFAULT_SETTINGS: CustomBulletsSettings = {
  level1: '•',
  level2: '◦',
  level3: '▪',
  level4: '▫',
  level5: '⁃',
  enabled: true
};

export default class CustomBulletsPlugin extends Plugin {
  settings: CustomBulletsSettings;

  async onload() {
    console.log('Loading Custom Bullets plugin');

    await this.loadSettings();

    // Register the settings tab
    this.addSettingTab(new CustomBulletsSettingTab(this.app, this));

    // Register the editor extension
    this.registerEditorExtension([
      this.createEditorExtension()
    ]);

    // Add a status bar item
    const statusBarItem = this.addStatusBarItem();
    statusBarItem.setText('Custom Bullets: ' + (this.settings.enabled ? 'ON' : 'OFF'));

    // Add a command to toggle the plugin
    this.addCommand({
      id: 'toggle-custom-bullets',
      name: 'Toggle Custom Bullets',
      callback: () => {
        this.settings.enabled = !this.settings.enabled;
        statusBarItem.setText('Custom Bullets: ' + (this.settings.enabled ? 'ON' : 'OFF'));
        this.saveSettings();
        this.updateActiveMDView();
      }
    });
  }

  createEditorExtension() {
    const plugin = this;
    
    return {
      // Process line by line
      processLine(line: any, lineText: string, lineIdx: number, cursor?: any) {
        if (!plugin.settings.enabled) return line;
        
        // Only process lines that start with list markers
        const listMatch = lineText.match(/^(\s*)(-|\*|\+)(\s+)(.*)/);
        if (!listMatch) return line;
        
        const [, indent, bullet, space, content] = listMatch;
        
        // Calculate indentation level (each level is 2 or 4 spaces, or a tab)
        let level = 1;
        if (indent) {
          // Count tabs as one level each
          const tabCount = (indent.match(/\t/g) || []).length;
          
          // Count spaces (assuming 2 spaces per level)
          const spaceCount = indent.replace(/\t/g, '').length;
          const spaceLevel = Math.floor(spaceCount / 2);
          
          level = 1 + tabCount + spaceLevel;
        }
        
        // Get the appropriate bullet for this level
        let customBullet;
        switch (level) {
          case 1: customBullet = plugin.settings.level1; break;
          case 2: customBullet = plugin.settings.level2; break;
          case 3: customBullet = plugin.settings.level3; break;
          case 4: customBullet = plugin.settings.level4; break;
          default: customBullet = plugin.settings.level5; break;
        }
        
        // Replace the bullet character
        const newLine = indent + customBullet + space + content;
        return newLine;
      }
    };
  }
  
  updateActiveMDView() {
    const activeLeaf = this.app.workspace.activeLeaf;
    if (activeLeaf && activeLeaf.view instanceof MarkdownView) {
      // Force refresh
      const editor = activeLeaf.view.editor;
      const cursor = editor.getCursor();
      const text = editor.getValue();
      editor.setValue(text);
      editor.setCursor(cursor);
    }
  }

  onunload() {
    console.log('Unloading Custom Bullets plugin');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class CustomBulletsSettingTab {
  plugin: CustomBulletsPlugin;
  
  constructor(app: any, plugin: CustomBulletsPlugin) {
    this.plugin = plugin;
  }
  
  display() {
    const { containerEl } = this;
    containerEl.empty();
    
    containerEl.createEl('h2', { text: 'Custom Bullets Settings' });
    
    new Setting(containerEl)
      .setName('Enable Custom Bullets')
      .setDesc('Toggle custom bullets on or off')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enabled)
        .onChange(async (value) => {
          this.plugin.settings.enabled = value;
          await this.plugin.saveSettings();
          this.plugin.updateActiveMDView();
        }));
    
    new Setting(containerEl)
      .setName('Level 1 Bullet')
      .setDesc('Character to use for level 1 bullets')
      .addText(text => text
        .setValue(this.plugin.settings.level1)
        .onChange(async (value) => {
          this.plugin.settings.level1 = value || '•';
          await this.plugin.saveSettings();
          this.plugin.updateActiveMDView();
        }));
    
    new Setting(containerEl)
      .setName('Level 2 Bullet')
      .setDesc('Character to use for level 2 bullets')
      .addText(text => text
        .setValue(this.plugin.settings.level2)
        .onChange(async (value) => {
          this.plugin.settings.level2 = value || '◦';
          await this.plugin.saveSettings();
          this.plugin.updateActiveMDView();
        }));
    
    new Setting(containerEl)
      .setName('Level 3 Bullet')
      .setDesc('Character to use for level 3 bullets')
      .addText(text => text
        .setValue(this.plugin.settings.level3)
        .onChange(async (value) => {
          this.plugin.settings.level3 = value || '▪';
          await this.plugin.saveSettings();
          this.plugin.updateActiveMDView();
        }));
    
    new Setting(containerEl)
      .setName('Level 4 Bullet')
      .setDesc('Character to use for level 4 bullets')
      .addText(text => text
        .setValue(this.plugin.settings.level4)
        .onChange(async (value) => {
          this.plugin.settings.level4 = value || '▫';
          await this.plugin.saveSettings();
          this.plugin.updateActiveMDView();
        }));
    
    new Setting(containerEl)
      .setName('Level 5+ Bullet')
      .setDesc('Character to use for level 5 and deeper bullets')
      .addText(text => text
        .setValue(this.plugin.settings.level5)
        .onChange(async (value) => {
          this.plugin.settings.level5 = value || '⁃';
          await this.plugin.saveSettings();
          this.plugin.updateActiveMDView();
        }));
  }
}
