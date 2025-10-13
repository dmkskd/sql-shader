# Keyboard Shortcuts

This document lists all keyboard shortcuts available in the SQL Shader Editor.

## Global Shortcuts

These shortcuts work anywhere in the application.

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+/` / `Cmd+/` | **Help Mode** | Toggle context-aware help overlay with tooltips |
| `Ctrl+P` / `Cmd+P` | **Profile** | Run query profiler (ClickHouse: full profiling, DuckDB: console stats) |
| `Space` | **Play/Pause** | Toggle shader execution (when not typing in editor) |
| `Escape` | **Close** | Close active modal or help overlay |

## Editor Shortcuts

These shortcuts work when the SQL editor has focus (CodeMirror).

### Core Actions

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+S` / `Cmd+S` | **Save** | Save the current shader to browser storage |
| `Ctrl+Enter` / `Cmd+Enter` | **Compile** | Compile and run the shader (when autocompile is OFF) |

## Standard CodeMirror Shortcuts

CodeMirror provides many built-in shortcuts:

### Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl+Home` / `Cmd+Home` | Go to start of document |
| `Ctrl+End` / `Cmd+End` | Go to end of document |
| `Ctrl+Left` / `Alt+Left` | Move cursor to word start |
| `Ctrl+Right` / `Alt+Right` | Move cursor to word end |

### Selection

| Shortcut | Action |
|----------|--------|
| `Ctrl+A` / `Cmd+A` | Select all |
| `Shift+Arrow Keys` | Extend selection |
| `Ctrl+D` / `Cmd+D` | Delete line |

### Editing

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` / `Cmd+Z` | Undo |
| `Ctrl+Y` / `Cmd+Shift+Z` | Redo |
| `Ctrl+/` / `Cmd+/` | Toggle comment |
| `Tab` | Indent selection |
| `Shift+Tab` | Dedent selection |

### Search

| Shortcut | Action |
|----------|--------|
| `Ctrl+F` / `Cmd+F` | Find |
| `Ctrl+G` / `Cmd+G` | Find next |
| `Ctrl+Shift+G` / `Cmd+Shift+G` | Find previous |
| `Ctrl+H` / `Cmd+Alt+F` | Replace |

## UI Button Shortcuts

These are accessible via buttons in the interface:

- **Stop/Play**: Stop or resume shader execution (❚❚ button)
- **Restart**: Reset shader time to 0 (↺ button)
- **Profile**: Run performance profiling (Profile button)
- **Stats**: Toggle performance statistics panel
- **Overlay Mode**: Toggle editor overlay on canvas (Overlay button)
- **Share**: Generate shareable link (🔗 button) - *currently disabled*

## Tips

1. **Save often**: Use `Ctrl+S` / `Cmd+S` to save your work frequently
2. **Quick compile**: When autocompile is off, use `Ctrl+Enter` / `Cmd+Enter` to quickly test changes
3. **Overlay mode**: Use `Ctrl+Shift+O` / `Cmd+Shift+O` to see your shader and code simultaneously
4. **Browser shortcuts**: Note that some shortcuts may conflict with browser defaults (e.g., `Ctrl+W` closes tabs)

## Platform-Specific Notes

- **Windows/Linux**: Use `Ctrl` key
- **macOS**: Use `Cmd` (Command) key for most shortcuts
- **macOS**: Some shortcuts may use `Option` (Alt) instead of `Ctrl`

## Help System

The **Help Overlay** (`Ctrl+/` / `Cmd+/`) is context-aware:

- **Main UI**: Shows tooltips for editor, canvas, engine selector, performance stats, etc.
- **Profiler Modal**: Shows tooltips for profiler tabs (Query Summary, Trace Log, FlameGraph, etc.)
- **EXPLAIN Tab**: When inside EXPLAIN, shows only sub-tab tooltips (Plan, Pipeline, Query Tree, AST)
- **Engine-Aware**: Profile button tooltip changes based on active engine (ClickHouse vs DuckDB)

Press `Ctrl+/` anywhere to see context-specific help!

## Preventing Browser Defaults

The custom shortcuts (`Ctrl+S`, `Ctrl+Enter`, etc.) prevent default browser actions:

- `Ctrl+S` normally opens the browser's Save Page dialog - this is prevented
- The shader is saved to browser localStorage instead

## Future Enhancements

Potential shortcuts to add:

- `Ctrl+Shift+S`: Save as (prompt for new name)
- `Ctrl+O`: Open shader picker (asset manager)
- `Ctrl+N`: New shader from template
- `F5` or `Ctrl+R`: Restart shader
- `Ctrl+Shift+A`: Toggle autocompile
- `Ctrl+Shift+O`: Toggle overlay mode
- `Ctrl+Shift+P`: Toggle performance stats panel
