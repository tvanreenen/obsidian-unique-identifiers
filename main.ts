import { Plugin, TFile, Notice } from 'obsidian';
import { UniqueIdSettingTab } from './settings';
import { generateId, isExcluded } from './utils';

interface UniqueIdSettings {
  idType: 'uuid' | 'ulid' | 'nanoid' | 'cuid' | `ksuid`;
  excludePaths: string[];
  autoAssignOnCreate: boolean;
}

const DEFAULT_SETTINGS: UniqueIdSettings = {
  idType: 'uuid',
  excludePaths: [],
  autoAssignOnCreate: true,
};

export default class UniqueIdPlugin extends Plugin {
  settings: UniqueIdSettings;

  async onload() {
    await this.loadSettings();

    this.registerEvent(
      this.app.vault.on('create', async (file) => {
        if (file instanceof TFile) {
          if (this.settings.autoAssignOnCreate) {
            await this.tryAssignId(file, false);
          }
        }
      })
    );

    this.addCommand({
      id: 'add-or-refresh-id-current-note',
      name: 'Add or Refresh ID for Current Note',
      callback: async () => {
        const file = this.app.workspace.getActiveFile();
        if (file) {
          await this.tryAssignId(file, true);
          new Notice(`Unique identifier refreshed for current note.`);
        } else {
          new Notice('No active markdown file.');
        }
      }
    });

    this.addSettingTab(new UniqueIdSettingTab(this.app, this));
  }

  async tryAssignId(file: TFile, force = false) {
    if (file.extension !== 'md') return;
    if (isExcluded(file, this.settings.excludePaths)) return;

    const key = this.settings.idType;
    const cache = this.app.metadataCache.getFileCache(file);
    const existing = cache?.frontmatter?.[key];
    
    if (!force && existing) return;
    
    await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
      if (force || !frontmatter[key]) {
        frontmatter[key] = generateId(key);
      }
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
