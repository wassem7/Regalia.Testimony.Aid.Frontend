/** Domain types shared across the Testimony Aid portal. */

export type TestimonyStatus = "pending" | "accepted";
export type AttachmentType = "image" | "document";
export type TestimonySource = "member" | "admin";
export type AdminRole = "Super Admin" | "Admin" | "Viewer";

/** Controlled category list — mirrors GlobalConstants.TestimonyCategories. */
export const TESTIMONY_CATEGORIES = [
  "Healing",
  "Provision",
  "Salvation",
  "Deliverance",
  "Family",
  "Breakthrough",
  "Other",
] as const;
export type TestimonyCategory = (typeof TESTIMONY_CATEGORIES)[number];

/** Mirrors the backend `AdminTestimonyDto`. */
export interface Testimony {
  id: string;
  title: string;
  body: string;
  isAnonymous: boolean;
  memberId: string;
  submitterName: string;
  submitterTkn?: string | null;
  submitterImageUrl?: string | null;
  attachmentUrl?: string | null;
  attachmentType?: AttachmentType | null;
  category?: string | null;
  tags?: string[] | null;
  source: TestimonySource;
  status: TestimonyStatus;
  reviewedByMemberId?: string | null;
  reviewedAt?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

/** Payload for admin-creating a testimony (POST /api/testimony-aid). */
export interface CreateTestimonyPayload {
  title: string;
  body: string;
  testifierName?: string;
  isAnonymous: boolean;
  category?: string | null;
  tags?: string[] | null;
  attachmentData?: string | null;
  attachmentType?: AttachmentType | null;
  publishImmediately: boolean;
}

/** Payload for admin-editing a testimony (PATCH /api/testimony-aid/{id}). */
export interface AdminUpdateTestimonyPayload {
  title: string;
  body: string;
  isAnonymous: boolean;
  category?: string | null;
  tags?: string[] | null;
  attachmentData?: string | null;
  attachmentType?: AttachmentType | null;
}

export interface Admin {
  id: string;
  name: string;
  tkn: string;
  role: AdminRole;
  imageUrl?: string | null;
  lastLoginAt?: string | null;
  isActive: boolean;
}

/** Raw admin row as returned by GET /api/testimony-aid-admin. */
export interface ApiAdmin {
  id: string;
  memberId: string;
  memberName: string;
  memberImageUrl?: string | null;
  tkn: string;
  role: string; // e.g. "testimony aid super admin"
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  addedByMemberId?: string | null;
  addedByName?: string | null;
}

/** Maps a backend role string to a display label. */
export function roleLabel(role: string): AdminRole {
  const r = role.toLowerCase();
  if (r.includes("super")) return "Super Admin";
  if (r.includes("viewer")) return "Viewer";
  return "Admin";
}

/** Maps a display label to the backend role string the API expects. */
export function roleValue(role: AdminRole): string {
  if (role === "Super Admin") return "testimony aid super admin";
  if (role === "Viewer") return "testimony aid viewer";
  return "testimony aid admin";
}

/** Roles selectable when adding an admin. */
export const ADMIN_ROLES: AdminRole[] = ["Admin", "Super Admin", "Viewer"];

/** Raw profile from GET /api/admin/testimony-aid/profile. */
export interface ApiProfile {
  id: string;
  firstName: string;
  lastName: string;
  tkn: string;
  imageUrl?: string | null;
  role?: string | null;
}

/** The signed-in admin, normalized for display. */
export interface Profile {
  name: string;
  tkn: string;
  imageUrl?: string | null;
  role: AdminRole;
}

export function toProfile(p: ApiProfile): Profile {
  return {
    name: `${p.firstName} ${p.lastName}`.trim(),
    tkn: p.tkn,
    imageUrl: p.imageUrl,
    role: roleLabel(p.role ?? ""),
  };
}

/** Normalizes a raw API admin into the UI `Admin` shape. */
export function toAdmin(a: ApiAdmin): Admin {
  return {
    id: a.id,
    name: a.memberName,
    tkn: a.tkn,
    role: roleLabel(a.role),
    imageUrl: a.memberImageUrl,
    lastLoginAt: a.lastLoginAt,
    isActive: a.isActive,
  };
}

/** Mirrors the backend `PagedResult<T>`. */
export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/** Mirrors the backend `ApiResponseV2<T>` envelope. */
export interface ApiEnvelope<T> {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: T;
  errors: string[] | null;
}
