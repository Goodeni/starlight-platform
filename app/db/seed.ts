import { getDb } from "../api/queries/connection";
import { packages } from "./schema";

async function seed() {
  const db = getDb();

  // Check if packages already exist
  const existing = await db.select().from(packages);
  if (existing.length > 0) {
    console.log("Packages already seeded, skipping...");
    return;
  }

  // Seed training packages
  await db.insert(packages).values([
    {
      name: "Базовый",
      price: 1500,
      description: "Разбор игры и консультация",
      features: JSON.stringify(["Разбор игры", "Консультация с тренером"]),
    },
    {
      name: "Продвинутый",
      price: 2000,
      description: "Разбор + Персональный план",
      features: JSON.stringify([
        "Разбор игры",
        "Консультация",
        "Персональный план тренировок",
      ]),
    },
    {
      name: "PRO",
      price: 4000,
      description: "Полный разбор + Мониторинг",
      features: JSON.stringify([
        "Разбор игры",
        "Консультация",
        "Персональный план тренировок",
        "Разбор таймингов",
        "Разбор гранат",
        "Экономика игры",
        "Базовые действия по карте",
        "Мониторинг результатов",
      ]),
    },
  ]);

  console.log("Seed complete: 3 packages created");
}

seed().catch(console.error);
