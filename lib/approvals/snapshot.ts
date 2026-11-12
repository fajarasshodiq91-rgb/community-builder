import { createHash, randomUUID } from "crypto";
import { CommunityBlueprint } from "@/lib/blueprint/types";
import {
  ApprovalSnapshot,
  ApprovalSnapshotSchema,
  ChangePreview,
  ChangePreviewSchema,
  PlannedChannelOperation,
  PlannedRoleOperation,
} from "./types";

/**
 * Computes a deterministic SHA-256 hash of a Community Blueprint
 */
export function computeBlueprintHash(blueprint: CommunityBlueprint): string {
  // Sort keys for canonical representation
  const canonicalString = JSON.stringify(blueprint, Object.keys(blueprint).sort());
  return createHash("sha256").update(canonicalString).digest("hex");
}

/**
 * Creates an immutable Approval Snapshot
 */
export function createApprovalSnapshot(blueprint: CommunityBlueprint): ApprovalSnapshot {
  const hash = computeBlueprintHash(blueprint);
  const snapshot: ApprovalSnapshot = {
    id: `appr_${randomUUID().slice(0, 12)}`,
    blueprintHash: hash,
    approvedAt: new Date().toISOString(),
    version: 1,
    blueprint,
    creatorConfirmed: true,
  };

  return ApprovalSnapshotSchema.parse(snapshot);
}

/**
 * Verifies that a blueprint matches the approved snapshot hash.
 * Any modification after approval invalidates prior approval.
 */
export function verifyApprovalIntegrity(
  snapshot: ApprovalSnapshot,
  currentBlueprint: CommunityBlueprint
): boolean {
  const currentHash = computeBlueprintHash(currentBlueprint);
  return snapshot.blueprintHash === currentHash;
}

/**
 * Generates an explicit Change Preview comparing the blueprint to the target server state
 */
export function generateChangePreview(
  snapshot: ApprovalSnapshot,
  existingState: {
    existingChannels?: string[];
    existingRoles?: string[];
  } = {}
): ChangePreview {
  const existingChannelSet = new Set(
    (existingState.existingChannels || []).map((c) => c.toLowerCase().trim().replace(/^[#\s]+/, ""))
  );
  const existingRoleSet = new Set(
    (existingState.existingRoles || []).map((r) => r.toLowerCase().trim())
  );

  const plannedChannels: PlannedChannelOperation[] = [];
  const plannedRoles: PlannedRoleOperation[] = [];
  const plannedCategories: string[] = [];

  let channelsToCreate = 0;
  let rolesToCreate = 0;

  // Plan roles
  for (const role of snapshot.blueprint.roles) {
    const isExisting = existingRoleSet.has(role.name.toLowerCase().trim());
    if (isExisting) {
      plannedRoles.push({
        action: "skip_existing",
        roleName: role.name,
        permissionPreset: role.permissionPreset,
        purpose: role.purpose,
      });
    } else {
      rolesToCreate++;
      plannedRoles.push({
        action: "create_role",
        roleName: role.name,
        permissionPreset: role.permissionPreset,
        purpose: role.purpose,
      });
    }
  }

  // Plan categories and channels
  for (const category of snapshot.blueprint.categories) {
    plannedCategories.push(category.name);
    for (const channel of category.channels) {
      const normalizedName = channel.name.toLowerCase().trim().replace(/^[#\s]+/, "");
      const isExisting = existingChannelSet.has(normalizedName);

      if (isExisting) {
        plannedChannels.push({
          action: "skip_existing",
          categoryName: category.name,
          channelName: channel.name,
          kind: channel.kind,
          purpose: channel.purpose,
          targetRoleAccess: "Member",
        });
      } else {
        channelsToCreate++;
        plannedChannels.push({
          action: "create_channel",
          categoryName: category.name,
          channelName: channel.name,
          kind: channel.kind,
          purpose: channel.purpose,
          targetRoleAccess: "Member",
        });
      }
    }
  }

  const safetyInvariants: string[] = [
    "Zero Deletions: No existing channels, roles, messages, or server data will be deleted.",
    "Idempotent: Channels and roles that already exist will be detected and skipped.",
    "Least-Privilege: Only 'Manage Channels' and 'Manage Roles' permissions are requested.",
    "Audit Recorded: Every operation will produce an immutable audit log entry.",
  ];

  const preview: ChangePreview = {
    snapshotId: snapshot.id,
    blueprintHash: snapshot.blueprintHash,
    targetPlatform: "discord",
    summary: {
      categoriesToCreate: plannedCategories.length,
      channelsToCreate,
      rolesToCreate,
      deletionsCount: 0,
    },
    plannedCategories,
    plannedChannels,
    plannedRoles,
    safetyInvariants,
  };

  return ChangePreviewSchema.parse(preview);
}
