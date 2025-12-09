import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TaskPriority } from '../task.entity';

export const normalizeAttachmentInput = (
  value: unknown,
): string[] | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter((item) => Boolean(item.length));
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed.length) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .filter((item) => Boolean(item.length));
      }
    } catch (_error) {
      // ignore JSON parse error and fallback to comma separated values
    }

    return trimmed
      .split(',')
      .map((item) => item.trim())
      .filter((item) => Boolean(item.length));
  }

  return undefined;
};

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @Transform(({ value }) => {
    if (!value) {
      return undefined;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  })
  @IsDate()
  deadline: Date;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    return value === 'true';
  })
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @Transform(({ value }) => normalizeAttachmentInput(value))
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
