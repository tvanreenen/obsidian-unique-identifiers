// modals.ts
import { Modal, App } from 'obsidian';

export class ConfirmModal extends Modal {
	constructor(
		app: App,
		private message: string,
		private onConfirm: () => void
	) {
		super(app);
	}

	onOpen() {
		this.setTitle('Confirm Action');
		const frag = createFragment();

		frag.createEl('p', { text: this.message });

		const buttons = frag.createDiv({ cls: 'modal-button-container' });

		const confirmBtn = buttons.createEl('button', { text: 'Yes, proceed', cls: 'mod-cta' });
		confirmBtn.onclick = () => {
			this.close();
			this.onConfirm();
		};

		const cancelBtn = buttons.createEl('button', { text: 'Cancel' });
		cancelBtn.onclick = () => this.close();

		this.setContent(frag);
	}

	onClose() {
		this.contentEl.empty();
	}
}
