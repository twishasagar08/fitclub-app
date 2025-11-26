import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthModule } from "./modules/auth.module";
import { UsersModule } from "./modules/users.module";
import { StepsModule } from "./modules/steps.module";
import { GoogleFitModule } from "./modules/google-fit.module";
import { LeaderboardModule } from "./modules/leaderboard.module";
import { SchedulerModule } from "./modules/scheduler.module";
import { User } from "./entities/user.entity";
import { StepRecord } from "./entities/step.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Configure TypeORM with Neon DB connection string
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const isProduction = process.env.NODE_ENV === "production";

        return {
          type: "postgres",
          url: process.env.DATABASE_URL,
          entities: [User, StepRecord],
          synchronize: !isProduction,
          extra: {
            ssl: {
              rejectUnauthorized: false,
            },
          },
        };
      },
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    StepsModule,
    GoogleFitModule,
    LeaderboardModule,
    SchedulerModule,
  ],
})
export class AppModule {}