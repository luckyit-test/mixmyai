import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TasksModule } from './tasks/tasks.module'
import { WebsocketModule } from './websocket/websocket.module'
import { DatabaseModule } from './database/database.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    DatabaseModule,
    TasksModule,
    WebsocketModule,
  ],
})
export class AppModule {}
