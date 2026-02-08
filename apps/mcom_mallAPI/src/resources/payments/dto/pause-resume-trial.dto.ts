import { IsEnum, IsNotEmpty } from 'class-validator';

export enum TrialAction {
  PAUSE = 'pause',
  RESUME = 'resume',
}

export class PauseResumeTrialDto {
  @IsEnum(TrialAction)
  @IsNotEmpty()
  action: TrialAction;
}
