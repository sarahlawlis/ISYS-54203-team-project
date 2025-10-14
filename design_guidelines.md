# Design Guidelines: Project Management Platform

## Design Approach
**Reference-Based Approach**: Drawing inspiration from Asana's intuitive project views and Airtable's flexible form builder interface, creating a utility-focused platform optimizing for efficiency and workflow clarity.

## Core Design Elements

### A. Color Palette

**Light Mode (Primary):**
- Primary: 203.9 88.3% 53.1% (bright blue) - CTAs, active states, primary actions
- Secondary: 210 25% 7.8% (dark navy) - text, headers, important UI elements
- Background: 0 0% 100% (white) - main background
- Card Background: 180 6.7% 97.1% (light grey) - card surfaces, containers
- Accent: 211.6 51.4% 92.7% (light blue) - hover states, highlights, selected items
- Text Primary: 210 25% 7.8% (dark navy)
- Text Secondary: 210 15% 45% (muted grey)
- Border: 210 15% 88% (light border)
- Success: 142 71% 45% (green)
- Warning: 38 92% 50% (amber)
- Error: 0 84% 60% (red)

**Dark Mode:**
- Background: 210 25% 7.8% (dark navy)
- Card Background: 210 20% 12% (elevated dark)
- Text Primary: 0 0% 98% (near white)
- Text Secondary: 210 15% 70% (muted light)
- Border: 210 15% 25% (dark border)
- Primary/Accent colors remain vibrant for contrast

### B. Typography

**Font Families:**
- Primary: 'Open Sans', system-ui, sans-serif (headings, body, UI)
- Monospace: 'Menlo', 'Monaco', monospace (code blocks, data values, attribute names)

**Type Scale:**
- H1: 2.5rem (40px), font-weight 700, line-height 1.2
- H2: 2rem (32px), font-weight 600, line-height 1.3
- H3: 1.5rem (24px), font-weight 600, line-height 1.4
- H4: 1.25rem (20px), font-weight 600, line-height 1.5
- Body: 1rem (16px), font-weight 400, line-height 1.6
- Small: 0.875rem (14px), font-weight 400, line-height 1.5
- Tiny: 0.75rem (12px), font-weight 500, line-height 1.4

### C. Layout System

**Spacing Scale (Tailwind units):**
- Primary increments: 1, 2, 3, 4, 6, 8, 12, 16 (0.25rem base)
- Common padding: p-4, p-6, p-8 for cards and sections
- Common margins: m-2, m-4, m-6 for element spacing
- Gap spacing: gap-3, gap-4, gap-6 for grids and flex layouts

**Grid System:**
- Container max-width: 1280px (max-w-7xl)
- Dashboard layout: 12-column grid with 1rem gutters
- Sidebar width: 256px (w-64) collapsible to 64px icons-only
- Content area: Fluid with responsive breakpoints

**Border Radius:**
- Cards/Containers: 1.3rem (rounded-[1.3rem])
- Buttons: 0.5rem (rounded-lg)
- Input fields: 0.5rem (rounded-lg)
- Small elements: 0.375rem (rounded-md)

### D. Component Library

**Navigation:**
- Top bar: 64px height, primary background, logo left, user profile right
- Sidebar: Collapsible navigation with icon + label, active state with accent background
- Breadcrumbs: Text links with "/" separator, current page in primary color

**Cards:**
- Base card: Light grey background, 1.3rem radius, p-6 padding, subtle shadow
- Project card: Header with title/status, body with key attributes, footer with actions
- Task card: Compact design with assignee avatar, due date, priority indicator
- Workflow node: Rounded cards with connector points, draggable with visual feedback

**Forms & Inputs:**
- Text inputs: 40px height, rounded-lg, border on focus (primary color)
- Dropdowns: Native select styling with custom chevron icon
- Checkboxes/Radio: Custom styled with primary color fills
- Attribute builder: Drag-and-drop zone with placeholder states
- Form validation: Inline error messages in error color below fields

**Buttons:**
- Primary: Solid primary background, white text, hover darkens
- Secondary: Outline with primary border, primary text, hover fills with accent
- Tertiary: Text only, primary color, hover with light background
- Icon buttons: Square 40px, rounded-md, hover with accent background
- Button groups: Connected with shared borders, active state highlighted

**Data Display:**
- Tables: Striped rows, hover highlight, sortable headers with icons
- Lists: Card-based with dividers, infinite scroll loading
- Kanban boards: Column-based with drag-and-drop, swimlanes for grouping
- Timeline view: Horizontal bars with color-coded status, milestones marked

**Workflow Designer:**
- Canvas: Light grey grid background, zoom controls, minimap in corner
- Nodes: Card-based with type icons, connector ports (input/output)
- Edges: Curved lines with arrows, color-coded by type (task/router/data)
- Toolbox: Sidebar palette with draggable node types
- Properties panel: Right sidebar showing selected node configuration

**Dashboards:**
- Widget cards: Modular components with resize handles, drag to reorder
- Chart types: Line, bar, pie, donut using primary color palette
- Stat cards: Large number display with trend indicators (↑↓)
- Saved search widgets: Quick filter chips with result counts

**Overlays:**
- Modals: Centered, max-width 600px, dark overlay backdrop, close X button
- Sidesheets: Slide from right, 400px width, form-based interactions
- Tooltips: Small popover, dark background, white text, 4px arrow
- Notifications: Toast in top-right, auto-dismiss, color-coded by type

### E. Interactions & States

**Hover States:**
- Cards: Subtle lift with shadow increase
- Buttons: Background darkens 10%, cursor pointer
- Links: Underline appears, color darkens
- Icons: Scale 1.05, color shifts to primary

**Active/Focus States:**
- Inputs: Primary border, subtle glow shadow
- Selected items: Accent background with primary text
- Active workflow nodes: Primary border, elevated z-index
- Pressed buttons: Slight inset shadow effect

**Loading States:**
- Skeleton screens: Pulsing grey placeholders matching content shape
- Spinners: Circular primary color for inline actions
- Progress bars: Linear primary color fill for multi-step processes

**Empty States:**
- Illustration + message: Centered, friendly empty state graphics
- Call-to-action: Primary button to create first item
- Help text: Secondary text explaining next steps

### Images & Illustrations

**No Hero Image Required** - This is a utility application focused on workflow and productivity.

**Iconography:**
- Use Heroicons via CDN for consistent UI icons
- Custom workflow node icons (<!-- CUSTOM ICON: database connector -->, <!-- CUSTOM ICON: router -->, etc.)
- Avatar placeholders: Initials on colored background when no image available

**Visual Elements:**
- Empty state illustrations: Simple line art in primary color
- Onboarding graphics: Step-by-step guide visuals
- Status indicators: Color-coded dots and badges
- Progress visualization: Gantt-style bars and completion circles

## Implementation Notes

- Maintain 4.5:1 contrast ratio for WCAG AA compliance
- Support keyboard navigation throughout (tab order, shortcuts)
- Provide dark mode toggle in user preferences with persistent state
- Use responsive breakpoints: mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
- Implement optimistic UI updates for immediate feedback on actions
- Cache workflow designs locally for offline editing capability