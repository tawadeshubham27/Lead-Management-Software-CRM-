const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@agency.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@agency.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  const leads = [
    { name: 'Rahul Sharma', phone: '+919876543210', email: 'rahul@example.com', source: 'Instagram', status: 'New' },
    { name: 'Priya Patel', phone: '+919876543211', email: 'priya@example.com', source: 'Facebook Ads', status: 'Contacted' },
    { name: 'Amit Kumar', phone: '+919876543212', email: 'amit@example.com', source: 'WhatsApp', status: 'Qualified' },
    { name: 'Sneha Reddy', phone: '+919876543213', email: 'sneha@example.com', source: 'Website', status: 'Proposal Sent' },
    { name: 'Vikram Singh', phone: '+919876543214', email: 'vikram@example.com', source: 'Referral', status: 'Won' },
  ];

  for (const leadData of leads) {
    const lead = await prisma.lead.upsert({
      where: { phone: leadData.phone },
      update: {},
      create: leadData,
    });
    console.log(`✅ Lead created: ${lead.name}`);
  }

  console.log('\n🎉 Seed complete! Login with: admin@agency.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
