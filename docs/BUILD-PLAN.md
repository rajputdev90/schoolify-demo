# Schoolify build plan

Frontend-only school management demonstration. Fictional school: The Maplewood School, Pune. Demo day: 17 November 2026. Academic year: 2026–27. No database, authentication provider, payments, email, SMS, or AI provider.

## Design system

Inter throughout, 14px body, 12px metadata, 28–36px page headings. Paper #f7f8fa; ink #242633; muted #777986; border #e9eaf0; student violet #7c62d9; mint #dff3e8. Teacher blue, parent teal, principal navy, management emerald, examination indigo, admin graphite. Light and dark semantic tokens. The recognizable detail is an abstract orbital learning illustration paired with an airy daily agenda, with a frosted navigation dock.

Landing: left-aligned hero and a working role preview, followed by audience-specific narrative sections. Portal: narrow sidebar, quiet header, main workspace, optional right daily agenda. Mobile: hidden sidebar, search/menu dialog, compact dock. Not every module belongs in the dock.

## Architecture

- Next.js App Router, statically exported routes, no runtime application server.
- `src/components/ui`: accessible shadcn-style Radix primitives.
- `src/components/shell`: navigation, theme and session controls.
- `src/features`: bounded workflow components reused where appropriate.
- `src/lib/types.ts`, `data.ts`, `navigation.ts`: typed records and central definitions.
- `src/lib/permissions.ts`: central capabilities and scoped records.
- `src/lib/service.ts`: validated demo commands, single replaceable service boundary.
- `src/lib/store.ts`: shared Zustand state, versioned browser persistence.
- `tests`: meaningful permission and cross-portal workflow checks.

## Delivery order

1. Dependencies, tokens, reusable components.
2. Landing, demo login, role routes.
3. Shell and dock.
4. Student learning workflows.
5. Teacher publishing and attendance.
6. Parent records, fees and meetings.
7. Principal oversight and approvals.
8. Management finances and operations.
9. Examination workflow.
10. Admin configuration and permissions.
11. Cross-portal state verification.
12. Responsive/accessibility QA and meaningful tests.
13. Production build and deployment notes.

Deployment requires the user's explicit approval. Do not publish as part of the local build.
