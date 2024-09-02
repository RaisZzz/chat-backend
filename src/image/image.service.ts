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

  async saveFile(image: Express.Multer.File, key?: string | number) {
    const dir = 'uploads';

    // if (!fs.existsSync(dir)) {
    //   fs.mkdirSync(dir);
    // }

    const path = `${dir}/image_${
      key ? `${key}_` : ''
    }${new Date().getTime()}.jpeg`;

    // Optimize and save image
    const metadata = await sharp(image.buffer)
      .resize({
        width: 1400,
        height: 1400,
        fit: sharp.fit.inside,
      })
      .jpeg({ quality: 90, mozjpeg: true })
      .withMetadata()
      .toFile(path);

    // Save image info to database
    return await this.imageRepository.create({
      width: metadata?.width || 0,
      height: metadata?.height || 0,
      size: metadata?.size || 0,
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
