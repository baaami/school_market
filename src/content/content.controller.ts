import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';

@Controller('content')
export class ContentController {
    constructor(
        private readonly contentService: ContentService
    ) {}

    @Get(':id')
    read(@Param('id') contentId: number) {
        return this.contentService.findOne(contentId);
    }

    @Post()
    write(@Body() createContentDto: CreateContentDto) {
        return this.contentService.writeOne(createContentDto);
    }
    
    @Patch(':id')
    update(@Body() updateContentDto: UpdateContentDto, @Param('id') contentId: number) {
        return this.contentService.UpdateOne(updateContentDto, contentId);
    }

    @Delete(':id')
    delete(@Param('id') contentId: number) {
        return this.contentService.DeleteOne(contentId);
    }    
}