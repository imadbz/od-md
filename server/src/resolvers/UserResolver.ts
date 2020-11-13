import { Resolver, Query, Arg } from "type-graphql";
import { User } from "../entities/User";

@Resolver()
export class UserResolver {
  @Query(() => [User])
  Users(
    @Arg("skip") skip: number,
    @Arg("take") take: number,
    @Arg("search", { nullable: true }) search: string,
  ) {

    if (search) {
      return User.createQueryBuilder()
        .select()
        .where("user.name like :search or user.shortBio like :search", { search })
        .getMany();
    }

    return User.find({ skip, take });
  }

  @Query(() => User)
  User(@Arg("id") id: string) {
    return User.findOne({ where: { id } });
  }
}

