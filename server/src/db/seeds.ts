import { connectDatabase } from "./index";
import { getConnection } from 'typeorm'
import faker from 'faker';
import { User } from "../entities/User";

const users = new Array(50).fill(null)
  .map((user, index) =>
    user = { name: `${faker.name.firstName()} ${faker.name.lastName()}`, shortBio: faker.lorem.words(7), isVerified: faker.random.boolean(), imageUrl: `https://i.pravatar.cc?u=${index}` }
  )

const seed = async () => {
  try {
    console.log("[seed] : running...");

    const db = await connectDatabase();
    db.users.clear();

    // Todo: figure out Typeorm API to use `db` for bulk insert instead of creating connection here
    await getConnection()
      .createQueryBuilder()
      .insert()
      .into(User)
      .values(users)
      .execute();

    console.log("[seed] : success");
  } catch {
    throw new Error("failed to seed database");
  }
};

seed();
