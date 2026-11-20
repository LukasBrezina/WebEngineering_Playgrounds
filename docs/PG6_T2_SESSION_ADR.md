# ADR: Session cookie instead of JWT

Playground 6, Task 2 – Login and session.

* **Context:** Users log in to the bear API; the React app runs on the same origin (Vite proxy / nginx), and logout must invalidate the credential immediately.
* **Options:** (1) server-side session: a random session id in a cookie, sessions stored in PostgreSQL; (2) JWT: signed token with the user data, verified without a database lookup.
* **Decision:** Server-side session. `POST /api/auth/login` stores a 256-bit random id with `user_id` and `expires_at` (7 days) in the `sessions` table and sets the cookie `sid` (`HttpOnly`, `Secure` in production, `SameSite=Lax`, `Path=/api`) via `@fastify/cookie`.
* **Why:** Logout and revocation are a simple `DELETE` of the row; a JWT stays valid until it expires unless a denylist is added, which makes it stateful anyway. PostgreSQL is already part of the stack, and one API instance does not need stateless tokens.
* **Consequences:**
  * Every authenticated request costs one database lookup (indexed by primary key).
  * Expired sessions stay in the table until they are cleaned up; `/api/auth/me` ignores them.
  * The cookie is sent automatically, so CSRF has to be considered (`SameSite=Lax` blocks cross-site POSTs).
  * The session id is not readable from JavaScript, so an XSS attacker cannot steal it, only use it while the page is open.
