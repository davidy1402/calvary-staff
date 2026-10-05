# Admin PIN setup

The app verifies the coordinator PIN in the `verify-admin-pin` Edge Function. The PIN is never stored in the browser or committed to this repository.

Before deploying the functions, securely set these Supabase function secrets:

- `ADMIN_PIN_SALT`: 16 or more random bytes, standard Base64 encoded.
- `ADMIN_PIN_HASH`: Base64 PBKDF2-SHA-256 output for the chosen PIN, using the salt above and 310,000 iterations.

Generate both values outside the repository with a trusted password-management or secrets workflow. Also deploy `verify-admin-pin` and `admin-data`, then run `schema.sql`. The schema leaves anonymous reads available for the volunteer roster, but routes all cloud writes through `admin-data`, which validates the seven-day opaque admin session server-side.

The opaque session is stored on the device so editing survives refreshes. It is invalidated locally when the administrator exits edit mode and expires server-side after seven days.

## Weekly services and holiday exceptions

Services repeat automatically from their configured weekday. The app does not create empty roster rows for every week. Administrators can add a date exception from **编辑模式 → 例外日期**:

- **暂停聚会** hides that day's duty roster and clearly shows the reason to all members.
- **照常举行＋提示** keeps the service and shows a holiday notice.

After pulling this feature, run the updated `schema.sql` and redeploy `admin-data` so `service_exceptions` can be read, synced in real time, and written through the existing protected admin session.
