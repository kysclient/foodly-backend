import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    },
    namespace: '/meal-plan',
})
export class MealPlanGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(MealPlanGateway.name);
    private connectedClients = new Map<string, string>(); // socketId -> userId

    constructor(private jwtService: JwtService) { }

    handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

            if (!token) {
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token);
            const userId = payload.sub;

            this.connectedClients.set(client.id, userId);
            client.join(`user-${userId}`);

            this.logger.log(`User ${userId} connected with socket ${client.id}`);
        } catch (error) {
            this.logger.error('Connection failed:', error);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = this.connectedClients.get(client.id);
        if (userId) {
            this.connectedClients.delete(client.id);
            this.logger.log(`User ${userId} disconnected`);
        }
    }

    @SubscribeMessage('join-meal-plan')
    handleJoinMealPlan(client: Socket, mealPlanId: string) {
        client.join(`meal-plan-${mealPlanId}`);
        this.logger.log(`Client ${client.id} joined meal-plan-${mealPlanId}`);
    }

    notifyMealPlanStatus(userId: string, data: any) {
        this.server.to(`user-${userId}`).emit('meal-plan-status', data);
    }

    notifyMealPlanUpdate(mealPlanId: string, data: any) {
        this.server.to(`meal-plan-${mealPlanId}`).emit('meal-plan-updated', data);
    }

    broadcastToUser(userId: string, event: string, data: any) {
        this.server.to(`user-${userId}`).emit(event, data);
    }
}