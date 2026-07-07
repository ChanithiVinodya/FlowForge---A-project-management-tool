import * as taskService from './task.service';
import * as taskRepo from './task.repository';
import * as listRepo from '../lists/list.repository';
import { ApiError } from '../../utils/ApiError';

jest.mock('./task.repository');
jest.mock('../lists/list.repository');
jest.mock('../activities/activity.service');
jest.mock('../notifications/notification.service');

describe('TaskService', () => {
  const projectId = 'p1';
  const boardId = 'b1';
  const listId = 'l1';
  const userId = 'u1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should throw error if list is not in project', async () => {
      (listRepo.findListInBoard as jest.Mock).mockResolvedValue(null);

      await expect(
        taskService.createTask(projectId, boardId, listId, userId, { title: 'Test' })
      ).rejects.toThrow(ApiError.notFound('List not found'));
    });

    it('should throw error if assignee is not a member', async () => {
      (listRepo.findListInBoard as jest.Mock).mockResolvedValue({ id: listId });
      (taskRepo.isProjectMember as jest.Mock).mockResolvedValue(false);

      await expect(
        taskService.createTask(projectId, boardId, listId, userId, { title: 'Test', assigneeId: 'u2' })
      ).rejects.toThrow(ApiError.badRequest('Assignee must be a member of this project'));
    });

    it('should create task and log activity', async () => {
      const task = { id: 't1', title: 'Test', listId };
      (listRepo.findListInBoard as jest.Mock).mockResolvedValue({ id: listId });
      (taskRepo.createTask as jest.Mock).mockResolvedValue(task);

      const result = await taskService.createTask(projectId, boardId, listId, userId, { title: 'Test' });

      expect(result).toEqual(task);
      expect(taskRepo.createTask).toHaveBeenCalledWith(listId, userId, { title: 'Test' });
    });
  });

  describe('moveTask', () => {
    it('should throw error if target list not in project', async () => {
      (taskRepo.findTaskInProject as jest.Mock).mockResolvedValue({ id: 't1', listId: 'l1' });
      (taskRepo.findListInProject as jest.Mock).mockResolvedValue(null);

      await expect(
        taskService.moveTask(projectId, 't1', userId, { listId: 'l2', position: 1 })
      ).rejects.toThrow(ApiError.notFound('Target list not found'));
    });

    it('should move task and log activity', async () => {
      const task = { id: 't1', listId: 'l1', title: 'Task' };
      const movedTask = { id: 't1', listId: 'l2', position: 1 };
      
      (taskRepo.findTaskInProject as jest.Mock).mockResolvedValue(task);
      (taskRepo.findListInProject as jest.Mock).mockResolvedValue({ id: 'l2' });
      (taskRepo.moveTask as jest.Mock).mockResolvedValue(movedTask);

      const result = await taskService.moveTask(projectId, 't1', userId, { listId: 'l2', position: 1 });

      expect(result).toEqual(movedTask);
      expect(taskRepo.moveTask).toHaveBeenCalledWith('t1', { listId: 'l2', position: 1 });
    });
  });
});
