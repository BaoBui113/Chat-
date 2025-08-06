import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

import { CallService } from './call.service';
import { CallActionDto } from './dto/call-action.dto';
import { CreateCallDto } from './dto/create-call.dto';

@Controller('calls')
@UseGuards(AuthGuard)
export class CallController {
  constructor(private readonly callsService: CallService) {}

  @Post('')
  async makeCall(
    @Request() req: { user: { sub: string } },
    @Body() createCallDto: CreateCallDto,
  ) {
    return this.callsService.makeCall(createCallDto, req.user.sub);
  }

  @Patch(':id/accept')
  async acceptCall(
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
  ) {
    return this.callsService.acceptCall(id, req.user.sub);
  }

  @Patch(':id/reject')
  async rejectCall(
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
  ) {
    return this.callsService.rejectCall(id, req.user.sub);
  }

  @Patch(':id/end')
  async endCall(
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
    @Body() callActionDto: CallActionDto,
  ) {
    return this.callsService.endCall(id, req.user.sub, callActionDto);
  }

  @Get('history')
  async getCallHistory(@Request() req: { user: { sub: string } }) {
    return this.callsService.getCallHistory(req.user.sub);
  }
}
