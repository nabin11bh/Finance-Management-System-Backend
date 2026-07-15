import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const INCOME_CATEGORIES = [
  ["Software Development", "Custom software and web application development revenue."],
  ["Website Development", "Static and dynamic website development projects."],
  ["Mobile App Development", "iOS and Android application development."],
  ["ERP Development", "Enterprise resource planning system development."],
  ["Government Project", "Projects contracted with government entities."],
  ["School Training", "IT training programs delivered to school students."],
  ["College Training", "IT training programs delivered to college students."],
  ["Corporate Training", "IT training delivered to corporate organizations."],
  ["Online Class", "Online / remote training sessions."],
  ["Physical Class", "In-person classroom training sessions."],
  ["Consultancy", "IT consultancy and advisory services."],
  ["AMC / Maintenance", "Annual maintenance contracts and support retainers."],
  ["Hosting Services", "Web hosting service revenue."],
  ["Domain Services", "Domain registration and renewal revenue."],
  ["Other", "Income that does not fit other categories."],
];

const EXPENSE_CATEGORIES: [string, string, string][] = [
  ["Employee", "Salary", "Monthly salary payments to full-time employees."],
  ["Employee", "Bonus", "Performance or festival bonuses."],
  ["Employee", "Allowance", "Transport, meal, or other allowances."],
  ["Employee", "Freelancer Payment", "Payments to freelance contractors."],
  ["Office", "Rent", "Office space rental payments."],
  ["Office", "Electricity", "Electricity utility bills."],
  ["Office", "Water", "Water utility bills."],
  ["Office", "Internet", "Internet/broadband subscription."],
  ["Office", "Stationery", "Paper, pens, and general stationery."],
  ["Office", "Office Supplies", "General office consumables."],
  ["Office", "Furniture", "Office furniture purchases."],
  ["Office", "Maintenance", "Office repairs and maintenance."],
  ["Office", "Cleaning", "Cleaning services and supplies."],
  ["IT", "Server", "Physical or cloud server costs."],
  ["IT", "Hosting", "Web/app hosting subscriptions."],
  ["IT", "Domain", "Domain registration and renewals."],
  ["IT", "SSL", "SSL certificate purchases."],
  ["IT", "Software Subscription", "SaaS tool subscriptions (e.g., Figma, Notion)."],
  ["IT", "API Charges", "Third-party API usage fees."],
  ["Marketing", "Facebook Ads", "Meta/Facebook advertising spend."],
  ["Marketing", "Google Ads", "Google advertising spend."],
  ["Marketing", "Printing", "Banners, brochures, printed materials."],
  ["Marketing", "Events", "Event sponsorships and participation costs."],
  ["Travel", "Fuel", "Fuel for company vehicles."],
  ["Travel", "Travel", "Bus, flight, or taxi travel costs."],
  ["Travel", "Accommodation", "Hotel or lodging costs."],
  ["Entertainment", "Team Celebration", "Team outing or party expenses."],
  ["Entertainment", "Festival Celebration", "Dashain, Tihar, and other festival celebrations."],
  ["Entertainment", "Office Lunch", "Team lunch or refreshments."],
  ["Entertainment", "Gifts", "Client or employee gifts."],
  ["Miscellaneous", "Taxes", "Government tax payments."],
  ["Miscellaneous", "Bank Charges", "Bank service fees and transaction charges."],
  ["Miscellaneous", "Miscellaneous", "Expenses that do not fit other categories."],
];

async function main() {
  const accountantRole = await prisma.role.upsert({
    where: { name: "Accountant" },
    update: {},
    create: { name: "Accountant" },
  });
  await prisma.role.upsert({ where: { name: "Admin" }, update: {}, create: { name: "Admin" } });
  await prisma.role.upsert({ where: { name: "Super Admin" }, update: {}, create: { name: "Super Admin" } });

  const email = "accountant@digitalpathshalanepal.com";
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (!existingUser) {
    const seedPassword = process.env.SEED_ACCOUNTANT_PASSWORD;
    if (!seedPassword) {
      throw new Error(
        
      );
    }
    const passwordHash = await bcrypt.hash(seedPassword, 12);
    const user = await prisma.user.create({
      data: { fullName: "Default Accountant", email, passwordHash },
    });
    await prisma.userRole.create({ data: { userId: user.id, roleId: accountantRole.id } });
    console.log(`Seeded: ${email}`);
  }

  for (const [name, description] of INCOME_CATEGORIES) {
    const existing = await prisma.incomeCategory.findFirst({ where: { name } });
    if (!existing) await prisma.incomeCategory.create({ data: { name, description } });
  }

  for (const [groupName, name, description] of EXPENSE_CATEGORIES) {
    const existing = await prisma.expenseCategory.findFirst({ where: { name, groupName } });
    if (!existing) await prisma.expenseCategory.create({ data: { groupName, name, description } });
  }
  
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });