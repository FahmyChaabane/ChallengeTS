import { Schema, model, Types } from "mongoose";
import Hobby from "./hobby.schema";

interface IUser {
  name: string;
  hobbies: Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  hobbies: [{ type: Schema.Types.ObjectId, ref: "Hobby", required: false }],
});

userSchema.pre(
  "remove",
  { query: true, document: true },
  async function (next) {
    await Hobby.deleteMany({
      _id: { $in: this.hobbies },
    }).exec();
    next();
  }
);

const User = model<IUser>("User", userSchema);

export default User;
