import { Resolver, Query, Arg } from "type-graphql";
import { User } from "../entities/User";

@Resolver()
export class UserResolver {
  @Query(() => [User])
  Users(
    @Arg("skip") skip: number,
    @Arg("take") take: number,
    @Arg("search", { nullable: true }) search: string,
    @Arg("verified", { nullable: true }) verified?: boolean,
  ) {

    if (search || verified) {
      const queries = [];

      if (search) queries.push("(user.name like :search or user.shortBio like :search)")
      if (typeof verified !== 'undefined') queries.push("user.isVerified = :verified")

      let query = queries.join(' and ');

      return User.createQueryBuilder()
        .select()
        .where(query, { search, verified })
        .getMany();
    }

    return User.find({ skip, take });
  }

  @Query(() => User)
  User(@Arg("id") id: string) {
    return User.findOne({ where: { id } });
  }
}

