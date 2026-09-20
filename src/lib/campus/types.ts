export const ROLES = ["STUDENT", "STAFF", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const ITEM_TYPES = ["LOST", "FOUND"] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export const ITEM_STATUSES = [
  "SEARCHING",
  "UNDER_REVIEW",
  "MATCHED",
  "CLAIM_PENDING",
  "READY_FOR_PICKUP",
  "HANDED_OVER",
  "RETURNED",
  "REJECTED",
] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const CLAIM_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
  "HANDOVER_PENDING",
  "COMPLETED",
] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const CATEGORIES = [
  "Electronics",
  "Bags & luggage",
  "IDs & cards",
  "Keys",
  "Bottles & drinkware",
  "Apparel",
  "Accessories",
  "Other",
] as const;

export const CAMPUS_ZONES = [
  "Main Campus",
  "Library",
  "Student Center",
  "Administration Block",
  "Security Office",
] as const;

export const ITEM_COLORS = [
  "Black",
  "White",
  "Blue",
  "Navy",
  "Red",
  "Green",
  "Yellow",
  "Brown",
  "Gray",
  "Silver",
  "Gold",
  "Pink",
  "Purple",
  "Orange",
  "Other",
] as const;

export type CampusUser = {
  id: string;
  email: string;
  displayName: string;
  studentId: string;
  phone: string;
  campusZone: string;
  role: Role;
  karmaPoints: number;
  trustScore: number;
  itemsReturned: number;
  recoveredItems: number;
  falseClaims: number;
  incognitoFinder: boolean;
  concealResidence: boolean;
  smartMatchPush: boolean;
  claimAlerts: boolean;
  quietMode: boolean;
  theme: "light" | "dark" | "system";
  createdAt: string;
  assignedAreas?: string[];
  permissions?: {
    canConfirmReceipt: boolean;
    canVerifyClaims: boolean;
    canCompleteHandover: boolean;
  };
};

export type Desk = {
  id: string;
  name: string;
  location: string;
  hours: string;
  isOpen: boolean;
  tag: string | null;
  vaultCount: number;
  lockerNote: string | null;
  staffName: string | null;
  staffRole: string | null;
  isHighValue: boolean;
  is24Hours: boolean;
  detailNotes: string | null;
};

export type CampusItem = {
  id: string;
  reporterId: string;
  reporterName: string;
  title: string;
  category: string;
  description: string;
  color: string;
  brand: string;
  identifyingMarks: string;
  itemType: ItemType;
  status: ItemStatus;
  location: string;
  locationZone: string;
  photoUrl: string | null;
  custodyDeskId: string | null;
  inCustody: boolean;
  custodyStaffId?: string | null;
  matchScore: number | null;
  matchItemId: string | null;
  matchExplanation: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Claim = {
  id: string;
  itemId: string;
  itemTitle: string;
  claimantId: string;
  claimantName: string;
  verificationNote: string;
  status: ClaimStatus;
  reviewedBy: string | null;
  pinAvailable: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CampusNotification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  itemId: string | null;
  claimId: string | null;
  read: boolean;
  createdAt: string;
};

export type ActivityEvent = {
  id: string;
  userId: string;
  type: string;
  itemId: string | null;
  claimId: string | null;
  message: string;
  createdAt: string;
};

export type MatchBreakdown = {
  category: number;
  title: number;
  color: number;
  location: number;
  brand: number;
  description: number;
};

export type SmartMatchResult = {
  score: number;
  breakdown: MatchBreakdown;
  explanation: string;
};
