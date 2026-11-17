# Schoolify demo

Run `npm install`, then `npm run dev` and open http://127.0.0.1:3000. The scripts use the project-local Node runtime. `npm test` runs cross-role service checks; `npm run build` creates a static export in `out/` for Vercel or other static hosting.

This is an incomplete frontend prototype with fictional records. Demo sessions and role checks are not security controls. Browser storage is local to the device and does not sync; never enter real student data, passwords, or payment details. Payments, messages, paper uploads, check-in and study assistant responses are simulated.

Implemented interactions include student submissions, goals and bookmarks; teacher assignment and material publishing, grading, attendance, and paper submission; parent demo fee payments, messages, meetings and leave; notices and approvals; exam marks and publication; admin class teacher and family links; and basic operational records. Several detailed features in the original brief remain incomplete, including real document previews and exports, richer analytics, full admin configuration, fee reconciliation, complete teacher resources, and advanced student and examination workflows. Pages may provide a limited representation of a module rather than the complete requested workflow.

Do not deploy until the owner approves. A production deployment needs a backend with authentication, authorization, secure storage, and real service integrations.

## GitHub and Vercel deployment

The application uses Next.js App Router with `output: "export"`; all portal paths are generated at build time. It does not need environment variables for the demo. Use the lockfile and Node.js 22, run `npm ci`, and check `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. The build output is `out/` and must not be committed.

Create a private GitHub repository if demo source should remain private. Import that repository in Vercel, select the Next.js preset, keep the default install/build settings (the build command uses the project's `npm run build`), and set Node.js 22. Do not add secrets. Vercel should detect the output automatically; the static export is in `out/` if an override is needed. Verify the deployment is an intended demo, as frontend-only permissions are not security and no real school data belongs in this version. Vercel Git integration can deploy production commits from the configured production branch and create preview deployments for other branches.

## Backend migration checklist

- Replace mock login and browser session persistence with an authentication provider.
- Move `src/lib/data.ts` and the command handling in `src/lib/service.ts` to PostgreSQL-backed services with server-side validation and authorization.
- Enforce role and class permissions, parent-child relationships, and audit logs on the server, with database row-level policies where appropriate.
- Replace mock file names with access-controlled file storage; add actual document scanning and preview handling.
- Replace localStorage cross-portal synchronization with server records and real-time updates, with appropriate privacy controls.
- Implement notification delivery, AI integrations, and payment processing behind server-side interfaces only when deliberately commissioned; keep credentials server-side.
- Migrate only approved data and add backups, privacy controls, observability, and production security testing before handling real school information.
