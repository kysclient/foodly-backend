import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaginationUtil } from '../../common/utils/pagination.util';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: '사용자 알림 목록 조회' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  findAll(@Request() req, @Query() query: any) {
    const { page, limit } = PaginationUtil.getPaginationParams(query);
    return this.notificationsService.findByUser(req.user.id, {
      page,
      limit,
      unreadOnly: query.unreadOnly === 'true',
    });
  }

  @Post(':id/read')
  @ApiOperation({ summary: '알림 읽음 처리' })
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Post('read-all')
  @ApiOperation({ summary: '모든 알림 읽음 처리' })
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '알림 삭제' })
  remove(@Param('id') id: string, @Request() req) {
    return this.notificationsService.remove(id, req.user.id);
  }

  @Get('preferences')
  @ApiOperation({ summary: '알림 설정 조회' })
  getPreferences(@Request() req) {
    return this.notificationsService.getPreferences(req.user.id);
  }

  @Patch('preferences')
  @ApiOperation({ summary: '알림 설정 업데이트' })
  updatePreferences(
    @Request() req,
    @Body() updatePreferenceDto: UpdateNotificationPreferenceDto,
  ) {
    return this.notificationsService.updatePreferences(req.user.id, updatePreferenceDto);
  }

  @Post('send')
  @ApiOperation({ summary: '알림 전송 (테스트용)' })
  sendNotification(@Body() createNotificationDto: CreateNotificationDto, @Request() req) {
    return this.notificationsService.create({
      ...createNotificationDto,
      userId: req.user.id,
    });
  }
}