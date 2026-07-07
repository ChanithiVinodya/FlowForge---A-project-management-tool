import { Prisma, ProjectRole } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { positionAtIndex } from '../../utils/position';
import { publicUserSelect } from '../shared/selects';
import type { CreateProjectInput, UpdateProjectInput } from './project.dto';

const DEFAULT_LISTS = ['To Do', 'In Progress', 'Done'];

const projectWithCounts = {
  id: true,
  name: true,
  description: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
  owner: { select: publicUserSelect },
  _count: { select: { members: true, boards: true } },
} satisfies Prisma.ProjectSelect;

const projectDetailSelect = {
  id: true,
  name: true,
  description: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
  owner: { select: publicUserSelect },
  members: {
    select: {
      id: true,
      role: true,
      joinedAt: true,
      user: { select: publicUserSelect },
    },
    orderBy: { joinedAt: 'asc' as const },
  },
  boards: {
    select: { id: true, name: true, position: true, createdAt: true, updatedAt: true },
    orderBy: { position: 'asc' as const },
  },
} satisfies Prisma.ProjectSelect;

export async function findProjectsForUser(userId: string, skip: number, take: number) {
  const where: Prisma.ProjectWhereInput = {
    OR: [{ ownerId: userId }, { members: { some: { userId } } }],
  };

  const [items, total] = await prisma.$transaction([
    prisma.project.findMany({
      where,
      select: projectWithCounts,
      orderBy: { updatedAt: 'desc' },
      skip,
      take,
    }),
    prisma.project.count({ where }),
  ]);

  return { items, total };
}

export async function findProjectById(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    select: projectDetailSelect,
  });
}

export async function createProject(ownerId: string, input: CreateProjectInput) {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        name: input.name,
        description: input.description,
        ownerId,
        members: {
          create: { userId: ownerId, role: ProjectRole.OWNER },
        },
      },
      select: projectDetailSelect,
    });

    const board = await tx.board.create({
      data: { projectId: project.id, name: 'Main Board', position: 0 },
    });

    await tx.list.createMany({
      data: DEFAULT_LISTS.map((name, index) => ({
        boardId: board.id,
        name,
        position: positionAtIndex(index),
      })),
    });

    return tx.project.findUnique({
      where: { id: project.id },
      select: projectDetailSelect,
    });
  });
}

export async function updateProject(projectId: string, input: UpdateProjectInput) {
  return prisma.project.update({
    where: { id: projectId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
    },
    select: projectDetailSelect,
  });
}

export async function deleteProject(projectId: string) {
  return prisma.project.delete({ where: { id: projectId } });
}

export async function findMembership(projectId: string, userId: string) {
  return prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    include: { user: { select: publicUserSelect } },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: publicUserSelect,
  });
}

export async function addMember(projectId: string, userId: string, role: ProjectRole) {
  return prisma.projectMember.create({
    data: { projectId, userId, role },
    select: {
      id: true,
      role: true,
      joinedAt: true,
      user: { select: publicUserSelect },
    },
  });
}

export async function updateMemberRole(projectId: string, userId: string, role: ProjectRole) {
  return prisma.projectMember.update({
    where: { projectId_userId: { projectId, userId } },
    data: { role },
    select: {
      id: true,
      role: true,
      joinedAt: true,
      user: { select: publicUserSelect },
    },
  });
}

export async function removeMember(projectId: string, userId: string) {
  return prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId } },
  });
}
