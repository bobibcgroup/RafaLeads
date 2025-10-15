#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Create sample clinic
    const clinic = await prisma.clinic.upsert({
      where: { clinicId: 'clinic-001' },
      update: {},
      create: {
        clinicId: 'clinic-001',
        name: 'Dr. Smith\'s Aesthetic Clinic',
        city: 'New York',
        whatsapp: '+1234567890',
        phone: '+1234567890',
        email: 'info@drsmithclinic.com',
        website: 'https://drsmithclinic.com',
        address: '123 Main St, New York, NY',
        hours: 'Mon-Fri 9AM-6PM',
        notes: 'Premium aesthetic clinic',
      },
    });

    console.log('✅ Clinic created:', clinic.name);

    // Create dashboard token
    const token = await prisma.dashboardToken.upsert({
      where: { token: 'demo-token-123' },
      update: {},
      create: {
        token: 'demo-token-123',
        clinicId: 'clinic-001',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        active: true,
      },
    });

    console.log('✅ Token created:', token.token);

    // Create sample leads
        const leads = [
          {
            sessionId: 'session-001',
            clinicId: 'clinic-001',
            lang: 'EN',
            name: 'John Doe',
            phone: '+1234567890',
            treatmentId: 'botox',
            message: 'Interested in Botox treatment for forehead lines',
            notes: '',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          },
          {
            sessionId: 'session-002',
            clinicId: 'clinic-001',
            lang: 'AR',
            name: 'Jane Smith',
            phone: '+1987654321',
            treatmentId: 'filler',
            message: 'Looking for dermal fillers for lip enhancement',
            notes: 'Follow up scheduled for next week',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          },
          {
            sessionId: 'session-003',
            clinicId: 'clinic-001',
            lang: 'EN',
            name: 'Mike Johnson',
            phone: '+1555123456',
            treatmentId: 'laser',
            message: 'Interested in laser treatment for skin rejuvenation',
            notes: '',
            timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          },
          {
            sessionId: 'session-004',
            clinicId: 'clinic-001',
            lang: 'EN',
            name: 'Sarah Wilson',
            phone: '+1444333222',
            treatmentId: 'facial',
            message: 'Looking for facial treatment package',
            notes: 'Appointment scheduled for Friday 2PM',
            timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          },
          {
            sessionId: 'session-005',
            clinicId: 'clinic-001',
            lang: 'EN',
            name: 'David Brown',
            phone: '+1777888999',
            treatmentId: 'hair',
            message: 'Interested in hair restoration treatment',
            notes: 'Treatment completed successfully',
            timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          },
        ];

    for (const leadData of leads) {
      await prisma.lead.upsert({
        where: { sessionId: leadData.sessionId },
        update: {},
        create: leadData,
      });
    }

    console.log('✅ Sample leads created:', leads.length);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Dashboard URL:');
    console.log('http://localhost:3000/dashboard/demo-token-123');
    console.log('\n📊 Sample data includes:');
    console.log('- 1 clinic (Dr. Smith\'s Aesthetic Clinic)');
    console.log('- 1 dashboard token (demo-token-123)');
    console.log('- 5 sample leads with different statuses');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
