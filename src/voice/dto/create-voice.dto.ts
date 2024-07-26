export class CreateVoiceDto {
  readonly path: string;
  readonly size: number;
  readonly seconds: number;
  readonly waveFormLines: number[];
}
