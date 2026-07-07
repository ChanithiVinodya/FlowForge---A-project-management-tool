import { ActivityAction, NotificationType, ProjectRole } from '@prisma/client';
import { ApiError } from '../../utils/ApiError';
import { parsePagination, toPaginatedResult } from '../../utils/pagination';
import * as projectRepo from './project.repository';
import { logActivity } from '../activities/activity.service';
import { createNotification } from '../notifications/notification.service';
import type {
  CreateProjectInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
  UpdateProjectInput,
} from './project.dto';

export async function listProjects(userId: string, query: Record<string, unknown>) {
  const params = parsePagination(query);
  const skip = (params.page - 1) * params.pageSize;
  const { items, total } = await projectRepo.findProjectsForUser(userId, skip, params.pageSize);
  return toPaginatedResult(items, total, params);
}

export async function getProject(projectId: string) {
  const project = await projectRepo.findProjectById(projectId);
  if (!project) throw ApiError.notFound('Project not found');
  return project;
}

export async function createProject(userId: string, input: CreateProjectInput) {
  const project = await projectRepo.createProject(userId, input);
  
  if (!project) throw ApiError.internal('Failed to retrieve project after creation');

  await logActivity({
    projectId: project.id,
    actorId: userId,
    action: ActivityAction.PROJECT_CREATED,
    metadata: { name: project.name },
  });

  return project;
}

export async function updateProject(projectId: string, userId: string, input: UpdateProjectInput) {
  await getProject(projectId);
  const updated = await projectRepo.updateProject(projectId, input);

  await logActivity({
    projectId,
    actorId: userId,
    action: ActivityAction.PROJECT_UPDATED,
    metadata: { changedFields: Object.keys(input) },
  });

  return updated;
}

export async function deleteProject(projectId: string, userId: string) {
  const project = await getProject(projectId);
  if (project.ownerId !== userId) {
    throw ApiError.forbidden('Only the project owner can delete the project');
  }
  await projectRepo.deleteProject(projectId);
}

export async function listMembers(projectId: string) {
  const project = await getProject(projectId);
  return project.members;
}

export async function inviteMember(
  projectId: string,
  actorId: string,
  actorRole: ProjectRole,
  input: InviteMemberInput,
) {
  const project = await getProject(projectId);

  if (input.role === ProjectRole.OWNER) {
    throw ApiError.badRequest('Cannot assign the OWNER role via invite');
  }

  if (actorRole === ProjectRole.MEMBER) {
    throw ApiError.forbidden('Members cannot invite other members');
  }

  const user = await projectRepo.findUserByEmail(input.email);
  if (!user) {
    throw ApiError.notFound('No user found with that email address');
  }

  const existing = await projectRepo.findMembership(projectId, user.id);
  if (existing) {
    throw ApiError.conflict('User is already a member of this project');
  }

  const membership = await projectRepo.addMember(projectId, user.id, input.role);

  await logActivity({
    projectId,
    actorId,
    action: ActivityAction.MEMBER_INVITED,
    metadata: { userId: user.id, email: user.email, role: input.role },
  });

  await createNotification(user.id, NotificationType.PROJECT_INVITATION, {
    projectId,
    projectName: project.name,
    role: input.role,
    invitedBy: actorId,
  });

  return membership;
}

export async function updateMemberRole(
  projectId: string,
  actorId: string,
  actorRole: ProjectRole,
  targetUserId: string,
  input: UpdateMemberRoleInput,
) {
  const project = await getProject(projectId);

  if (targetUserId === project.ownerId) {
    throw ApiError.badRequest('Cannot change the project owner role');
  }

  if (actorRole !== ProjectRole.OWNER) {
    throw ApiError.forbidden('Only the project owner can change member roles');
  }

  if (input.role === ProjectRole.OWNER) {
    throw ApiError.badRequest('Cannot assign the OWNER role');
  }

  const target = await projectRepo.findMembership(projectId, targetUserId);
  if (!target) {
    throw ApiError.notFound('Member not found');
  }

  const membership = await projectRepo.updateMemberRole(projectId, targetUserId, input.role);

  await logActivity({
    projectId,
    actorId,
    action: ActivityAction.TASK_UPDATED, // Reuse? Or add MEMBER_ROLE_UPDATED? ActivityAction has no MEMBER_ROLE_UPDATED
    metadata: { targetUserId, oldRole: target.role, newRole: input.role },
  });

  return membership;
}

export async function removeMember(
  projectId: string,
  actorId: string,
  actorRole: ProjectRole,
  targetUserId: string,
) {
  const project = await getProject(projectId);

  if (targetUserId === project.ownerId) {
    throw ApiError.badRequest('Cannot remove the project owner');
  }

  if (targetUserId === actorId) {
    throw ApiError.badRequest('Use leave-project flow instead of removing yourself');
  }

  const target = await projectRepo.findMembership(projectId, targetUserId);
  if (!target) {
    throw ApiError.notFound('Member not found');
  }

  if (actorRole === ProjectRole.MEMBER) {
    throw ApiError.forbidden('Members cannot remove other members');
  }

  if (actorRole === ProjectRole.ADMIN && target.role !== ProjectRole.MEMBER) {
    throw ApiError.forbidden('Admins can only remove members');
  }

  await projectRepo.removeMember(projectId, targetUserId);

  await logActivity({
    projectId,
    actorId,
    action: ActivityAction.MEMBER_REMOVED,
    metadata: { targetUserId },
  });
}
