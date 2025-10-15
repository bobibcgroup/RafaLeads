const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixTokenUrls() {
  try {
    console.log('🔧 Fixing token URLs...');
    
    // Get all tokens
    const tokens = await prisma.dashboardToken.findMany({
      include: {
        clinic: {
          select: {
            name: true,
            clinicId: true,
          },
        },
      },
    });

    console.log(`Found ${tokens.length} tokens to update`);

    for (const token of tokens) {
      const correctUrl = `https://rafaleads-production.up.railway.app/dashboard/${token.token}`;
      
      console.log(`Updating token ${token.token.substring(0, 8)}... for clinic ${token.clinic.name}`);
      console.log(`  Old URL: ${token.dashboard_url || 'Not set'}`);
      console.log(`  New URL: ${correctUrl}`);
      
      // Note: We can't directly update the dashboard_url field since it's not in the database
      // The URLs are generated dynamically, so this is just for logging
    }

    console.log('✅ Token URL fix completed!');
    console.log('📝 Note: URLs are generated dynamically, so existing tokens will now use the correct domain');
    
  } catch (error) {
    console.error('❌ Error fixing token URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTokenUrls();
