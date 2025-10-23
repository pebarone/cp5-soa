#!/bin/sh
set -e

echo "🚀 Starting Hotel Reservations API..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
until node -e "
const oracledb = require('oracledb');
oracledb.getConnection({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_URL
}).then(conn => {
  console.log('✅ Database connected!');
  conn.close();
  process.exit(0);
}).catch(err => {
  console.log('❌ Database not ready yet...');
  process.exit(1);
})
" 2>/dev/null; do
  echo "Retrying in 5 seconds..."
  sleep 5
done

# Start the application
echo "🌟 Starting application server..."
node app.js &
APP_PID=$!

# Wait for application to be ready
echo "⏳ Waiting for application to be ready..."
sleep 10

# Run seed if AUTO_SEED is enabled
echo "📝 AUTO_SEED value: '$AUTO_SEED'"
if [ "$AUTO_SEED" = "true" ]; then
  echo "🌱 Running database seed..."
  node db/seeds/seed.js || echo "⚠️  Seed failed (database might already have data)"
else
  echo "⏭️  Skipping seed (AUTO_SEED=$AUTO_SEED)"
fi

# Wait for the application process
wait $APP_PID
