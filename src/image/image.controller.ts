import { Controller, Get, Query, Res } from '@nestjs/common';
import { ImageService } from './image.service';
import { GetImageDto } from './dto/get-image.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Изображения')
@Controller('image')
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Get('')
  // @UseGuards(JwtAuthGuard, SmsGuard)
  async getImages(@Query() getImageDto: GetImageDto, @Res() res) {
    return this.imageService.getFile(getImageDto, res);
  }
}
