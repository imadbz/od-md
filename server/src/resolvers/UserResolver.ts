import { Resolver, Query, Arg } from "type-graphql";
import { User } from "../entities/User";

enum VerifiedStatus {
  'ALL' = 0,
  'VERIFIED' = 1,
  'NONVERIFIED' = 2
}

@Resolver()
export class UserResolver {
  @Query(() => [User])
  Users(
    @Arg("take", { nullable: true }) take: number = 10,
    @Arg("skip", { nullable: true }) skip: number = 0,
    @Arg("search", { nullable: true }) search: string,
    @Arg("verified", { nullable: true }) verified: VerifiedStatus,
  ) {

    const queries = [];

    if (search) queries.push("(user.name like :search or user.shortBio like :search)")
    if (verified === VerifiedStatus.VERIFIED) queries.push("user.isVerified = 1")
    if (verified === VerifiedStatus.NONVERIFIED) queries.push("user.isVerified = 0")

    let query = `${queries.join(' and ') || true} LIMIT ${take} OFFSET ${skip}`;

    return User.createQueryBuilder()
      .select()
      .where(query, { search })
      .getMany();
  }

  @Query(() => User)
  User(@Arg("id") id: string) {
    return User.findOne({ where: { id } });
  }
}

