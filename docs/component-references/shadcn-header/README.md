# Official shadcn header source

Unmodified source pulled from shadcn/ui’s official `sidebar-16` registry block on October 16, 2026.

- Preview: https://ui.shadcn.com/blocks/sidebar#sidebar-16
- Source payload: https://ui.shadcn.com/r/styles/new-york-v4/sidebar-16.json
- Repository: https://github.com/shadcn-ui/ui
- License: MIT; see LICENSE.md.

Files: site-header.tsx and its companion search-form.tsx.

The example provides a sticky header, sidebar toggle, breadcrumb trail, and search field. It is reference source only and has not been installed or connected to the restaurant demo. The search field is a UI example, not a working application search service.

Before integration, replace registry-internal imports with the project’s component paths, supply the SidebarProvider and --header-height value, and add the desired Pearl Island logo, product label, and login/profile control. Review the icon-only toggle’s accessible name. The source depends on shadcn Button, Separator, Breadcrumb, Sidebar/useSidebar, Input, Label, and lucide-react icons. Keep the original upstream example separate from the adapted product header.
