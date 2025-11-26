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
    // Configure TypeORM dynamically - prefer DATABASE_URL if present (and add SSL options for managed DBs).
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const isProduction = process.env.NODE_ENV === "production";

        if (process.env.DATABASE_URL) {
          // When using a connection string (DATABASE_URL) for managed DBs like Neon/RDS
          return {
            type: "postgres",
            url: process.env.DATABASE_URL,
            entities: [User, StepRecord],
            synchronize: !isProduction,
            extra: {
              ssl: {
                // For many managed DB services a self-signed/unknown CA may be used.
                // 'rejectUnauthorized: false' is commonly required to establish a TLS connection in Node.
                rejectUnauthorized: false,
              },
            },
          };
        }

        // Fallback to individual env vars
        return {
          type: "postgres",
          host: process.env.DATABASE_HOST || "localhost",
          port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
          username: process.env.DATABASE_USERNAME || "postgres",
          password: process.env.DATABASE_PASSWORD || "postgres",
          database: process.env.DATABASE_NAME || "fitclub",
          entities: [User, StepRecord],
          synchronize: !isProduction, // Only enabled outside of production
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
