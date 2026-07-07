import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import * as projectService from './project.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await projectService.listProjects(req.user!.id, req.query);
  res.status(200).json(result);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.createProject(req.user!.id, req.body);
  res.status(201).json({ project });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.getProject(req.params.projectId);
  res.status(200).json({ project });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.updateProject(req.params.projectId, req.user!.id, req.body);
  res.status(200).json({ project });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await projectService.deleteProject(req.params.projectId, req.user!.id);
  res.status(204).send();
});

export const listMembers = asyncHandler(async (req: Request, res: Response) => {
  const members = await projectService.listMembers(req.params.projectId);
  res.status(200).json({ members });
});

export const inviteMember = asyncHandler(async (req: Request, res: Response) => {
  if (!req.projectRole) throw ApiError.unauthorized();
  const member = await projectService.inviteMember(
    req.params.projectId,
    req.user!.id,
    req.projectRole,
    req.body,
  );
  res.status(201).json({ member });
});

export const updateMemberRole = asyncHandler(async (req: Request, res: Response) => {
  if (!req.projectRole) throw ApiError.unauthorized();
  const member = await projectService.updateMemberRole(
    req.params.projectId,
    req.user!.id,
    req.projectRole,
    req.params.userId,
    req.body,
  );
  res.status(200).json({ member });
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  if (!req.projectRole) throw ApiError.unauthorized();
  await projectService.removeMember(
    req.params.projectId,
    req.user!.id,
    req.projectRole,
    req.params.userId,
  );
  res.status(204).send();
});
