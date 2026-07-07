import { z } from 'zod';
import { ProjectRole } from '@prisma/client';
import { paginationQuerySchema } from '../shared/params.dto';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  description: z.string().trim().max(2000).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  role: z.nativeEnum(ProjectRole).default(ProjectRole.MEMBER),
});

export const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(ProjectRole),
});

export const listProjectsQuerySchema = paginationQuerySchema;

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
