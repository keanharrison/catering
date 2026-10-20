# Linear palette implementation

The built-in palettes were sampled from Linear Preferences on 2026-10-19, using the user-supplied linear-theme-aa-*.json captures. Source captures remain in Downloads and the Entrepreneurship workspace references/linear-themes folder.

app/src/components/themePalettes.json contains only the semantic tokens needed by this demo. Mapping: outer provider = page; sidebar provider = navigation; settings-section provider = cards; raised provider = popovers. Background uses --sx-1ubxoo9; text/borders use the named --color-* source variables; primary uses the Pearl Island turquoise (#00A1CA) instead of Linear's purple, focus uses --focus-ring-color. Sidebar styling consumes the same palette tokens.

The theme provider preserves the existing vite-ui-theme storage key and supports light, dark, classic-dark (labelled Gray), and system. It resolves named dark palettes to the existing dark class; system preference follows OS changes. The color theme picker is in the app header.

Semantic warning, success and error colors, order data and business rules remain in their existing systems. Login remains the explicitly requested light-only standalone page. These captures reproduce observed palette values, not Linear’s original theme-generation software.
