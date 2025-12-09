import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskPriority } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFiltersDto } from './dto/task-filters.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, newAttachments: string[]) {
    const task = this.tasksRepository.create({
      description: createTaskDto.description,
      deadline: createTaskDto.deadline,
      priority: createTaskDto.priority ?? TaskPriority.MEDIUM,
      completed: createTaskDto.completed ?? false,
      attachments: [
        ...(createTaskDto.attachments ?? []),
        ...(newAttachments ?? []),
      ],
    });

    return this.tasksRepository.save(task);
  }

  async findAll(filters: TaskFiltersDto) {
    const query = this.tasksRepository.createQueryBuilder('task');

    if (filters.search) {
      query.andWhere('LOWER(task.description) LIKE :search', {
        search: `%${filters.search.toLowerCase()}%`,
      });
    }

    if (filters.priority) {
      query.andWhere('task.priority = :priority', {
        priority: filters.priority,
      });
    }

    if (filters.dueFrom) {
      query.andWhere('task.deadline >= :dueFrom', { dueFrom: filters.dueFrom });
    }

    if (filters.dueTo) {
      query.andWhere('task.deadline <= :dueTo', { dueTo: filters.dueTo });
    }

    if (typeof filters.completed === 'boolean') {
      query.andWhere('task.completed = :completed', {
        completed: filters.completed,
      });
    }

    if (filters.overdue) {
      query.andWhere('task.deadline < :now AND task.completed = false', {
        now: new Date(),
      });
    }

    query.orderBy('task.deadline', 'ASC');

    return query.getMany();
  }

  async findOne(id: string) {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`La tarea con id ${id} no existe`);
    }
    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    newAttachments: string[],
  ) {
    const task = await this.findOne(id);

    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description;
    }
    if (updateTaskDto.deadline !== undefined) {
      task.deadline = updateTaskDto.deadline;
    }
    if (updateTaskDto.priority !== undefined) {
      task.priority = updateTaskDto.priority;
    }
    if (updateTaskDto.completed !== undefined) {
      task.completed = updateTaskDto.completed;
    }

    if (updateTaskDto.attachments !== undefined) {
      task.attachments = updateTaskDto.attachments;
    }

    if (newAttachments?.length) {
      task.attachments = [...(task.attachments ?? []), ...newAttachments];
    }

    return this.tasksRepository.save(task);
  }

  async remove(id: string) {
    const task = await this.findOne(id);
    await this.tasksRepository.remove(task);
    return { deleted: true };
  }
}
