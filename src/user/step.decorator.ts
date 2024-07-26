import { SetMetadata } from '@nestjs/common';

export const STEP_KEY = 'step';

export const Step = (step: number) => SetMetadata(STEP_KEY, step);
