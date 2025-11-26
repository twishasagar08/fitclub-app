import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { DataSource } from "typeorm";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validate database connection
  try {
    // Hardcoded for testing
    const testDatabaseUrl = "postgresql://neondb_owner:npg_LGmOsW3Pq1ip@ep-muddy-dust-a17yjitz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
    
    const dataSource = app.get(DataSource);
    console.log("🔍 Checking database connection...");
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log("Using hardcoded test URL:", testDatabaseUrl.substring(0, 40) + "...");

    await dataSource.query("SELECT NOW()");
    console.log("✅ Database connection established successfully");

    // Log connection string info (without sensitive data)
    const urlToTest = testDatabaseUrl || process.env.DATABASE_URL;
    if (urlToTest) {
      const urlPattern = /postgresql:\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/([^?]+)/;
      const match = urlToTest.match(urlPattern);
      console.log("URL pattern match:", !!match);
      if (match) {
        console.log("🌐 Connected to:", match[3]); // host
        console.log("💾 Database name:", match[5]); // database name
      } else {
        console.log("⚠️  Could not parse DATABASE_URL format");
      }
    } else {
      console.log("⚠️  DATABASE_URL not set");
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error("🔍 Check your DATABASE_URL environment variable");
    process.exit(1);
  }

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();