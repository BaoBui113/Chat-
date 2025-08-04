import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}
  @UseGuards(AuthGuard)
  @Post()
  create(
    @Request() req: { user: { sub: string; email: string; name?: string } },

    @Body() createMessageDto: CreateMessageDto,
  ) {
    const senderId = req.user.sub;
    return this.messagesService.create(createMessageDto, senderId);
  }

  @UseGuards(AuthGuard)
  @Get('conversation/:receiverId')
  getMessages(
    @Request() req: { user: { sub: string } },
    @Param('receiverId') receiverId: string,
  ) {
    const senderId = req.user.sub;
    return this.messagesService.getMessages(senderId, receiverId);
  }

  @UseGuards(AuthGuard)
  @Get('last-messages')
  lastUserMessages(@Request() req: { user: { sub: string } }) {
    const senderId = req.user.sub;
    return this.messagesService.lastUserMessages(senderId);
  }

  @Get()
  findAll() {
    return this.messagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messagesService.update(id, updateMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messagesService.remove(id);
  }
}
