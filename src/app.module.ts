import { Module } from '@nestjs/common';
import { MainController } from './main.controller';
import { ConfigModule } from '@nestjs/config';
import envConfig from './env';
import { ScheduleModule } from '@nestjs/schedule';
import { RegistryModule } from './model/registry/registry.module';
import { TaskService } from './task.service';

@Module({
  imports: [
    RegistryModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [envConfig.path],
    }),
  ],
  controllers: [MainController],
  providers: [TaskService],
})
export class AppModule {}
