# Firestore Security Specification

This document details the security contracts, invariants, and threat vectors examined to establish zero-trust, attribute-based access control (ABAC) on our Interactive CSE Study Organizer.

## 1. Data Invariants

- **Ownership & Privacy**: A study note MUST only be fetched, updated, or deleted by the user who created it (`notes.userId == request.auth.uid`). No global reads (lists or single gets) are permitted to prevent privacy leakage.
- **Progress Tracking Privacy**: A user's GATE and LeetCode tracker state document (`/users/{userId}/tracking/state`) MUST strictly read/write validate that `{userId}` in the path matches the authenticated `request.auth.uid`. No user can inspect or alter another user's preparation scores/schedules.
- **Rigorous Data Schema Validation**:
  - `notes` collection writes must enforce that `title` and `content` are non-empty strings of bounded length (such as under 1000 characters for titles, 50,000 for content).
  - Notes categorizing must be restricted strictly to one of `['LeetCode', 'DSA', 'GATE Prep', 'Web Dev', 'General']`.
  - All tags must be stored inside a List type bounded at size 20 or less.
- **Timestamp Integrity**: `createdAt` on notes is completely immutable on update. All `updatedAt` properties must enforce write-time validation equating them precisely to the server fallback `request.time`.

---

## 2. The "Dirty Dozen" Threat Payloads

A set of 12 highly destructive payload mutations analyzed against the access control ledger to guarantee security:

1. **The Ghost Field Insertion (Shadow Update)**: User attempts to save a note with unverified fields, bypass lists, or isAdmin privileges (`{ "title": "Math Note", "isAdmin": true, "content": "Proof" }`). Forbidden by exact field strictness checks.
2. **The Identity Takeover (Spoofing ownerId)**: ID `att_1` drafts a note setting `userId` to `victim_99` (`{ "userId": "victim_99", "title": "Hacked", "content": "..." }`). Denied since rules assert `incoming().userId == request.auth.uid`.
3. **The Orphaned Tracker Poisoning**: Attempting to set tracker values inside another user's state path: `write` on `/users/victim_99/tracking/state` by auth token of `attacker_3`. Denied as the variable `{userId}` under path check must match the active auth subject.
4. **The Infinite Payload Bloat (Exhaustion)**: Submitting a 5MB note title. Stopped by `.size() <= 200` validations on all user-controlled text dimensions.
5. **Atypical Enum Bypass (Category Spoofing)**: Setting `category` to `"MaliciousRootShellCode"` or similar custom type block. Blocked by checking `category in ['LeetCode', 'DSA', 'GATE Prep', 'Web Dev', 'General']`.
6. **Malicious ID Traversal (Path Injection)**: Specifying document IDs containing relative paths like `../` inside the study note or state directory to attempt parent index escape. Prevented by validating document IDs match regex `^[a-zA-Z0-9_\-]+$`.
7. **Backdated Timestamps (Temporal Hijacking)**: A client submitting note updates with `updatedAt: "2013-01-01T00:00:00Z"` to fake old entries. Rules enforce equality against `request.time`.
8. **Null-Auth Privilege Escalation**: User operates with no bearer token (`request.auth == null`) attempting to initialize notes. Prevented by global `isSignedIn()` checks on all resource entries.
9. **Creation Field Overwriting**: Trying to modify `createdAt` or changing `userId` values after Note creation during an HTTP update session. Stopped by updating checks enforcing `incoming().userId == existing().userId` and `incoming().createdAt == existing().createdAt`.
10. **Array Abuse (Blowing up Database Size)**: Attempting to submit 10,000 tags inside a single note request. Denied by the constraint `incoming().tags.size() <= 20`.
11. **Spoofed Admin Claims Injection**: Requesting access using a mock custom `auth.uid` token named `"admin"`. Prevented by ensuring our rules look up admin status solely on real database resources under `/admins/` document path with no implicit trusting of client properties.
12. **Blind Scraping (Unauthenticated List Querying)**: Querying general collections of CSE studies without filtering down the list constraints to `where('userId', '==', request.auth.uid)`. Denied since the list rule itself evaluates `resource.data.userId == request.auth.uid`.
