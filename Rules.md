# UI Style Rules

## Theme & Visual

- **Icons**: `text-primary-600` — applies to both light and dark themes
- **Text color**: `text-primary-900` — applies to both light and dark themes
- **Font**: `font-lato` (Lato) — use across the entire application
- **Theme**: All styles must be consistently applied in both light and dark themes

## Naming & Code Organization

- **File Naming**: PascalCase for component files, camelCase for utility and hook files
- **DRY**: Repeated UI patterns (icons, classes, styles) must be extracted into a variable or helper function to reduce code complexity
- **Comments**: Do not use emojis or emoticons in code comments
- **Console**: Remove any `console.log` found in existing files when editing them, unless the user explicitly asks to keep it



## Forms & Input

- **Input Sizing**: Always use `classNames={{ input: "h-8  py-1 text-xs" }}` on Input components

## Tables

- **Table Columns**: Table column headers should include relevant icons
- **Table Edit**: Use `src/components/shared/MasterFormDrawer.jsx` for edit forms in tables
- **Margin/Padding**: Use `px-2` instead of `px-(--margin-x)` for table and toolbar horizontal padding
- **Row Density**: Always default `enableRowDense` to `true` in table settings state

## Build

- **Build**: After any code changes, build the project and verify there are no errors before finalizing. Use `$env:DISABLE_ESLINT_PLUGIN="true"; yarn build --logLevel error` to ignore warnings for a fast build
