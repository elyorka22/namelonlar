import { NextResponse } from "next/server";

// Endpoint для проверки DATABASE_URL (безопасно, не показывает пароль)
export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    return NextResponse.json({
      error: "DATABASE_URL не установлен",
      hasDatabaseUrl: false,
    }, { status: 500 });
  }

  // Проверяем формат URL (без показа пароля)
  const urlPattern = /postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)/;
  const match = dbUrl.match(urlPattern);
  
  if (!match) {
    return NextResponse.json({
      error: "DATABASE_URL имеет неправильный формат",
      hasDatabaseUrl: true,
      format: "invalid",
    }, { status: 500 });
  }

  const [, user, , host, database] = match;
  const isPooler = host.includes("pooler.supabase.com");
  const hasPgbouncer = dbUrl.includes("pgbouncer=true");
  const port = host.includes(":6543") ? 6543 : host.includes(":5432") ? 5432 : "unknown";

  return NextResponse.json({
    hasDatabaseUrl: true,
    format: "valid",
    details: {
      user: user,
      host: host,
      database: database,
      port: port,
      isPooler: isPooler,
      hasPgbouncer: hasPgbouncer,
      isCorrectFormat: isPooler && port === 6543 && hasPgbouncer,
    },
    status: isPooler && port === 6543 && hasPgbouncer 
      ? "✅ Правильный формат (Connection Pooling)" 
      : "❌ Неправильный формат (используйте Connection Pooling URL с портом 6543)",
  });
}

