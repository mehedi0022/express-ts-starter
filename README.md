# Express TypeScript Starter

## Session lifecycle

- `POST /api/v1/auth/logout` revokes the refresh session identified by the
  refresh-token cookie and clears that cookie. Repeating the request is safe.
- `POST /api/v1/auth/logout-all` requires an access bearer token, revokes every
  refresh session owned by that user **including the current session**, and
  clears the caller's refresh-token cookie.
- `rememberMe=false` uses `SESSION_IDLE_TTL` and a browser-session cookie.
- `rememberMe=true` uses `SESSION_REMEMBER_ME_IDLE_TTL` and a persistent cookie.
- Sliding refresh is always capped by `SESSION_ABSOLUTE_TTL`.

Expired sessions and sessions revoked longer than
`SESSION_REVOKED_RETENTION` can be removed manually or from a platform cron:

```text
npm run sessions:cleanup
```

The cleanup command is safe to run repeatedly. Configure its database through
the same validated runtime environment as the application.

## Web security boundary

Authorization uses the persisted `User.role` as its source of truth with
reusable role, permission, and ownership middleware. Access tokens identify
the user but do not authorize a role: authentication loads the current role
from PostgreSQL on every protected request, so role changes take effect
immediately. New registrations default to `USER` at the database layer.

Persisted roles are `SUPER_ADMIN`, `ADMIN`, `USER`, `CUSTOMER`, `MODERATOR`,
`AUTHOR`, and `MANAGER`. The starter deliberately grants global user-management
permissions only to `SUPER_ADMIN` and `ADMIN`; all other roles start with the
same ownership-only access and can receive explicit permissions later.

User-management defaults are deliberately restrictive: admins may list and
delete users; users may read/update only their own non-sensitive profile;
admins may read/update any profile. Public registration remains only under
`/auth/register`.

Credentialed CORS uses exact origins from `CORS_ORIGINS`; wildcard origins are
rejected during configuration loading. The refresh token is HttpOnly and
scoped to `COOKIE_PATH` (`/api/v1/auth` by default). Production requires a
Secure cookie. `SameSite=lax` is the safe same-site default; cross-site clients
must explicitly choose `SameSite=none`, HTTPS, and an exact trusted origin.

CSRF protection assumes bearer access tokens are not browser-ambient, while the
refresh cookie is. Unsafe cookie-authenticated requests therefore require an
exact trusted `Origin` or `Referer`. SameSite and origin validation are
independent defenses. Non-browser and bearer-only requests may omit both
headers. This architecture does not need a synchronizer CSRF token unless more
general-purpose cookies are added later.

Rate limits use `express-rate-limit` and have separate global, login,
registration, refresh, and reserved forgot-password policies. Memory storage is
the zero-configuration default. Multi-instance deployments can set
`RATE_LIMIT_STORE=redis` and `REDIS_URL`; `rate-limit-redis` then shares counters
without changing route policy. Redis store failures are fail-closed.

`TRUST_PROXY=false` is the default. Behind a proxy, configure the precise hop
count or trusted proxy network. `TRUST_PROXY=true` is rejected in production
because it permits clients to spoof forwarding headers when the last proxy is
not guaranteed to sanitize them.
