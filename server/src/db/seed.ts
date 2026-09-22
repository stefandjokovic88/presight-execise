import { faker } from "@faker-js/faker";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { closeDb, DB_PATH, getDb } from "./connection.js";
import { createSchema } from "./schema.js";

const USER_COUNT = 10_000;

const HOBBIES = [
  "Reading",
  "Hiking",
  "Cooking",
  "Photography",
  "Gaming",
  "Painting",
  "Swimming",
  "Cycling",
  "Running",
  "Yoga",
  "Chess",
  "Gardening",
  "Fishing",
  "Traveling",
  "Music",
  "Dancing",
  "Writing",
  "Knitting",
  "Camping",
  "Skiing",
  "Surfing",
  "Climbing",
  "Baking",
  "Filmmaking",
  "Astronomy",
  "Birdwatching",
  "Collecting",
  "DIY",
  "Meditation",
  "Volunteering",
  "Board games",
  "Pottery",
  "Calligraphy",
  "Martial arts",
  "Scuba diving",
  "Horse riding",
  "Archery",
  "Woodworking",
  "Sewing",
  "Podcasting",
] as const;

const NATIONALITIES = [
  "American",
  "British",
  "Canadian",
  "Australian",
  "German",
  "French",
  "Italian",
  "Spanish",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Irish",
  "Portuguese",
  "Polish",
  "Czech",
  "Austrian",
  "Swiss",
  "Belgian",
  "Japanese",
  "Korean",
  "Chinese",
  "Indian",
  "Brazilian",
  "Mexican",
  "Argentinian",
  "South African",
  "New Zealander",
  "Singaporean",
] as const;

function resetDatabase(): void {
  closeDb();
  for (const suffix of ["", "-wal", "-shm"]) {
    const filePath = `${DB_PATH}${suffix}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

function populate(db: ReturnType<typeof getDb>): void {
  const insertHobby = db.prepare("INSERT INTO hobbies (name) VALUES (?)");
  const insertUser = db.prepare(`
    INSERT INTO users (id, avatar, first_name, last_name, age, nationality)
    VALUES (@id, @avatar, @first_name, @last_name, @age, @nationality)
  `);
  const insertUserHobby = db.prepare(`
    INSERT INTO user_hobbies (user_id, hobby_id) VALUES (?, ?)
  `);

  const seedAll = db.transaction(() => {
    const hobbyIds = HOBBIES.map((name) => {
      const result = insertHobby.run(name);
      return Number(result.lastInsertRowid);
    });

    for (let id = 1; id <= USER_COUNT; id++) {
      insertUser.run({
        id,
        avatar: `https://i.pravatar.cc/150?u=${id}`,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        age: faker.number.int({ min: 18, max: 80 }),
        nationality: faker.helpers.arrayElement(NATIONALITIES),
      });

      const hobbyCount = faker.number.int({ min: 0, max: 10 });
      const selectedHobbyIds = faker.helpers.arrayElements(hobbyIds, hobbyCount);

      for (const hobbyId of selectedHobbyIds) {
        insertUserHobby.run(id, hobbyId);
      }
    }
  });

  const startedAt = Date.now();
  seedAll();
  const elapsedMs = Date.now() - startedAt;

  const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get() as {
    count: number;
  };
  const hobbyCount = db.prepare("SELECT COUNT(*) AS count FROM hobbies").get() as {
    count: number;
  };
  const linkCount = db
    .prepare("SELECT COUNT(*) AS count FROM user_hobbies")
    .get() as { count: number };

  console.log(`Done in ${(elapsedMs / 1000).toFixed(2)}s`);
  console.log(`  users:          ${userCount.count.toLocaleString()}`);
  console.log(`  hobbies:        ${hobbyCount.count.toLocaleString()}`);
  console.log(`  user_hobbies:   ${linkCount.count.toLocaleString()}`);
}

/** Wipe and recreate the SQLite database with seed data. */
export function seedDatabase(options: { reset?: boolean } = {}): void {
  const reset = options.reset ?? true;
  console.log(
    `${reset ? "Seeding" : "Populating"} ${USER_COUNT.toLocaleString()} users into ${DB_PATH}`,
  );

  if (reset) {
    resetDatabase();
  }

  const db = getDb();
  createSchema(db);
  populate(db);
}

/** Seed only when the users table is empty (used on server/Docker startup). */
export function ensureDatabaseSeeded(): void {
  const db = getDb();
  const row = db.prepare("SELECT COUNT(*) AS count FROM users").get() as {
    count: number;
  };

  if (row.count > 0) {
    console.log(`SQLite ready (${row.count.toLocaleString()} users)`);
    return;
  }

  console.log("Empty database detected — seeding…");
  db.exec(`
    DELETE FROM user_hobbies;
    DELETE FROM hobbies;
    DELETE FROM users;
  `);
  populate(db);
}

const isCliEntry =
  Boolean(process.argv[1]) &&
  path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]!);

if (isCliEntry) {
  seedDatabase({ reset: true });
  closeDb();
}
