# Linear palette implementation

The five built-in palettes were sampled from Linear Preferences on 2026-10-19, using the user-supplied linear-theme-aa-*.json captures. Source captures remain in Downloads and the Entrepreneurship workspace references/linear-themes folder.

app/src/components/themePalettes.json contains only the semantic tokens needed by this demo. Mapping: outer provider = page; sidebar provider = navigation; settings-section provider = cards; raised provider = popovers. Background uses --sx-1ubxoo9; text/borders use the named --color-* source variables; primary uses --sx-n8xqcl, focus uses --focus-ring-color. Bootstrap RGB primary channels are converted from the captured D50 LCH values. Sidebar styling consumes the same palette tokens.

The theme provider preserves the existing vite-ui-theme storage key and supports light, pure-light, dark, magic-blue, classic-dark, and system. It resolves named dark palettes to the existing dark class and Tabler data-bs-theme attribute; system preference follows OS changes. Color theme pickers are available in the app header and isolated staff shell sidebar.

Semantic warning, success and error colors, order data and business rules remain in their existing systems. Login remains the explicitly requested light-only standalone page. These captures reproduce observed palette values, not Linear’s original theme-generation software.
