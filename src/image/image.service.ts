import { Injectable } from '@nestjs/common';
import imageSize from 'image-size';
import { InjectModel } from '@nestjs/sequelize';
import { Image } from './image.model';
import { readFileSync, unlinkSync } from 'fs';
import { dirname, join } from 'path';
import { Duplex } from 'stream';
import { GetImageDto } from './dto/get-image.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require('sharp');

const MAX_IMAGE_WIDTH: number = 1400;
const MAX_IMAGE_HEIGHT: number = 1400;

@Injectable()
export class ImageService {
  constructor(@InjectModel(Image) private imageRepository: typeof Image) {}

  async getFile(getImageDto: GetImageDto, res) {
    const image = await this.imageRepository.findOne({
      where: {
        id: getImageDto.id,
      },
    });

    const imageBuffer: Buffer = readFileSync(
      join(process.cwd(), `/${image.path}`),
    );
    const size = imageSize(imageBuffer);

    let querySize: number;

    switch (getImageDto.size) {
      case 'avatar':
        querySize = 100;
        break;
      case 'small':
        querySize = 300;
        break;
      case 'medium':
        querySize = 600;
        break;
      case 'big':
        querySize = 1000;
        break;
      case 'full':
        querySize = 1400;
        break;
    }

    const width: number = size.width >= querySize ? querySize : size.width;
    const height: number = size.height >= querySize ? querySize : size.height;

    const stream = new Duplex();

    if (querySize) {
      const sharpBuffer = await sharp(imageBuffer)
        .resize({
          width: size.width > size.height ? null : width,
          height: size.height > size.width ? null : height,
          fit: sharp.fit.inside,
        })
        .withMetadata()
        .jpeg()
        .toBuffer();
      stream.push(sharpBuffer);
    } else {
      stream.push(imageBuffer);
    }

    stream.push(null);
    return stream.pipe(res);
  }

  async saveFile(file: Express.Multer.File, key?: string | number) {
    const dir = 'uploads';

    // if (!fs.existsSync(dir)) {
    //   fs.mkdirSync(dir);
    // }

    const path = `${dir}/image_${
      key ? `${key}_` : ''
    }${new Date().getTime()}.jpeg`;

    const image = sharp(file.buffer);
    const metadata = await image.metadata();

    let newWidth = metadata.width;
    let newHeight = metadata.height;

    if (
      metadata.width > MAX_IMAGE_WIDTH ||
      metadata.height > MAX_IMAGE_HEIGHT
    ) {
      if (metadata.width > metadata.height) {
        newWidth = MAX_IMAGE_WIDTH;
        newHeight = Math.round(
          (metadata.height * MAX_IMAGE_WIDTH) / metadata.width,
        );
      } else {
        newHeight = MAX_IMAGE_HEIGHT;
        newWidth = Math.round(
          (metadata.width * MAX_IMAGE_HEIGHT) / metadata.height,
        );
      }
    }

    // Optimize and save image
    const newMetadata = await image
      .resize({
        width: newWidth,
        height: newHeight,
        fit: sharp.fit.inside,
      })
      .jpeg()
      .withMetadata()
      .toFile(path);

    // Save image info to database
    return await this.imageRepository.create({
      width: newMetadata?.width || 0,
      height: newMetadata?.height || 0,
      size: newMetadata?.size || 0,
      path,
    });
  }

  async deleteFile(img: Image) {
    try {
      unlinkSync(`${dirname(require.main.path)}/${img.path}`);
    } catch (e) {
      console.log('DELETE AVATAR ERROR ' + e);
    }

    await img.destroy();

    return true;
  }
}
