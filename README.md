# Obsidian Unique Identifiers

**Obsidian Unique Identifiers** is a plugin for [Obsidian](https://obsidian.md/) that automatically adds a unique identifier to the frontmatter of your notes. Choose from a variety of ID types and ensure every note is uniquely referenced for advanced workflows, integrations, and data management.

## Features

- **Automatic ID Insertion:** Automatically adds a unique identifier to the frontmatter whenever a new note is created.
- **Multiple ID Types:** Choose from several industry-standard unique ID formats:
  - UUID ([uuidjs/uuid](https://github.com/uuidjs/uuid))
  - CUID ([paralleldrive/cuid2](https://github.com/paralleldrive/cuid2))
  - NanoID ([ai/nanoid](https://github.com/ai/nanoid))
  - ULID ([ulid/javascript](https://github.com/ulid/javascript))
  - KSUID ([ValeriaVG/xksuid](https://github.com/ValeriaVG/xksuid))
- **Exclude Paths:** Configure folders or files to exclude from automatic ID insertion.
- **Bulk Backfill & Removal:** Add or remove IDs from existing notes in bulk via the plugin's settings page.
- **Command Palette Integration:** Open the command palette (`Cmd+P` or `Ctrl+P`) to quickly add or refresh the configured ID on the active note.

## Example

Each ID type uses a frontmatter property of the same name (e.g., `uuid`, `cuid`, `nanoid`, `ulid`, `ksuid`). If you select `uuid` as your ID type, your note's frontmatter will look like:

```yaml
---
uuid: 01H8YQ2K4ZJ8V7Q2K4ZJ8V7Q2K
---
```

## Installation

1. Open Obsidian's **Settings**.
2. Go to **Community Plugins** → **Browse**.
3. Search for "Unique Identifiers" and install.
4. Enable the plugin.
5. Configure your settings.

## Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check [issues page](#) or submit a pull request.

## Manual Installation & Development

1. **Download or Clone the Repository**
   ```sh
   git clone https://github.com/tvanreenen/obsidian-unique-identifiers.git
   ```
2. **Install Dependencies**
   ```sh
   npm install
   ```
3. **Build the Plugin**
   ```sh
   npm run dev
   ```
4. **Copy Build Files**
   - Copy `main.js`, `styles.css`, and `manifest.json` from the project root into a new folder named `unique-identifiers` inside your vault's `.obsidian/plugins/` directory:
     ```
     .obsidian/plugins/unique-identifiers/
       ├── main.js
       ├── styles.css
       └── manifest.json
     ```
5. **Enable the Plugin**
   - Open Obsidian, go to **Settings → Community Plugins**, and enable "Unique Identifiers".