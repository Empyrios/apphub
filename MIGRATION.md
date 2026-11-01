# Safe migration plan for Dayforge and DuoQuest

Do not delete repositories, change domains or remove the old Dayforge/DuoQuest pages as part of the first AppHub release.

## Stage 1: Independent hub

Create `Empyrios/apphub`, upload the AppHub source and enable GitHub Pages from Actions. Verify `/apphub/` works on desktop and phone.

## Stage 2: Separate DuoQuest

1. In the existing Dayforge-hosted DuoQuest, use **Settings → Export backup** on each device that has saved data.
2. Create a separate `Empyrios/duoquest` repository.
3. Move the existing `docs/duoquest/` application files to the new repository's publication folder. Keep relative asset paths intact.
4. Publish the new site; verify local storage is empty before importing old data. A different GitHub Pages path on the same `github.io` origin may share localStorage, but relying on that is unsafe if custom domains or browsers differ.
5. Restore each saved backup in the new app. Confirm dates, goals and memories before marking migration complete.
6. Update the DuoQuest `website` and `repository` values in AppHub and redeploy it.
7. Keep the old link as a redirect or a migration notice for at least one release cycle. Do not delete stored backups.

## Stage 3: Existing Dayforge

Dayforge remains in `Empyrios/dayforge`. Its old `dayforge-v1` localStorage key must not be cleared. Existing links to `/dayforge/` stay intact.

## Stage 4: Next apps

New apps receive independent repos and deployments. Each project owns its data model, CI, privacy policy and account/security requirements. AppHub reads no private project data and never acts as an authentication boundary.
