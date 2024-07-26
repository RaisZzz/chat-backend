import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Voice } from './voice.model';
import { readFileSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Duplex } from 'stream';
import { GetVoiceDto } from './dto/get-voice.dto';
import getAudioDurationInSeconds from 'get-audio-duration';
import { Error, ErrorType } from '../error.class';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const wav = require('node-wav');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

@Injectable()
export class VoiceService {
  constructor(@InjectModel(Voice) private voiceRepository: typeof Voice) {}

  async getFile(getVoiceDto: GetVoiceDto, res) {
    const voice: Voice = await this.voiceRepository.findOne({
      where: {
        id: getVoiceDto.voiceId,
      },
    });

    const voiceBuffer: Buffer = readFileSync(
      join(process.cwd(), `/${voice.path}`),
    );

    const stream: Duplex = new Duplex();
    stream.push(voiceBuffer);
    stream.push(null);
    return stream.pipe(res);
  }

  async saveFile(voice: Express.Multer.File, key?: string | number) {
    const dir = 'voices';

    const path = `${dir}/voice_${
      key ? `${key}_` : ''
    }${new Date().getTime()}.m4a`;

    // Save voice
    writeFileSync(path, voice.buffer);

    const seconds: number = Math.floor(await getAudioDurationInSeconds(path));
    if (seconds < 1) {
      throw new HttpException(
        new Error(ErrorType.VoiceLength),
        HttpStatus.BAD_REQUEST,
      );
    }

    const waveFormLines: number[] = await getAudioSamplesFormFilePath(path, 50);

    // Save voice info to database
    return await this.voiceRepository.create({
      size: voice.size,
      path,
      seconds,
      waveFormLines,
    });
  }
}

async function getAudioSamplesFormFilePath(
  m4aPath: string,
  pointsCount: number,
): Promise<number[]> {
  const wavPath: string = m4aPath.replace('m4a', 'wav');

  await ffmpegSync(m4aPath, wavPath);

  const data: Buffer = readFileSync(wavPath);
  unlinkSync(wavPath);
  const result = wav.decode(data);
  const samples = result.channelData[0];
  const normalizedSamples: number[] = normalizeArray(samples);
  const sampledPoints: number[] = normalizeArray(
    sampleArray(normalizedSamples, pointsCount),
  ).map((v) => Math.round(v * 100) / 100);

  return sampledPoints;

  function normalizeArray(arr: number[]): number[] {
    const minMax = arr.reduce(
      ([min, max], val) => [Math.min(min, val), Math.max(max, val)],
      [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY],
    );
    const min: number = minMax[0];
    const max: number = minMax[1];
    const range: number = max - min;
    return arr.map((val: number) => (val - min) / range);
  }

  function sampleArray(arr: number[], numPoints: number): number[] {
    const sampledPoints: number[] = [];
    const interval: number = Math.max(1, Math.floor(arr.length / numPoints));
    for (let i = 0; i < arr.length; i += interval) {
      let value = arr[i] - 0.5;
      if (value < 0) {
        value = -value;
      }

      value = Math.round(value * 100) / 100;

      sampledPoints.push(value);
    }
    return sampledPoints;
  }

  function ffmpegSync(m4aPath: string, wavPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(m4aPath)
        .toFormat('wav')
        .save(wavPath)
        .on('end', (): void => {
          resolve(null);
        })
        .on('error', (err: any) => {
          return reject(err);
        });
    });
  }
}
