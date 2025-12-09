import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { randomBytes } from 'crypto';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFiltersDto } from './dto/task-filters.dto';

const uploadsDir = join(process.cwd(), 'uploads');

const ensureUploadsDir = () => {
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
};

const multerStorage = diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadsDir();
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${randomBytes(4).toString('hex')}`;
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

const attachmentsInterceptor = FilesInterceptor('attachments', 10, {
  storage: multerStorage,
});

const toPublicPaths = (files?: Express.Multer.File[]) =>
  files?.map((file) => `/uploads/${file.filename}`) ?? [];

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Query() filters: TaskFiltersDto) {
    return this.tasksService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @UseInterceptors(attachmentsInterceptor)
  create(
    @Body() createTaskDto: CreateTaskDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.tasksService.create(createTaskDto, toPublicPaths(files));
  }

  @Put(':id')
  @UseInterceptors(attachmentsInterceptor)
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.tasksService.update(id, updateTaskDto, toPublicPaths(files));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
