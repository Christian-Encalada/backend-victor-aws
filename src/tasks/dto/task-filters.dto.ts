import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TaskPriority } from '../task.entity';

export class TaskFiltersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  })
  @IsDate()
  dueFrom?: Date;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  })
  @IsDate()
  dueTo?: Date;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    return value === true || value === 'true';
  })
  @IsBoolean()
  overdue?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === '') return undefined;
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  completed?: boolean;
}
