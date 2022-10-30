import { HobbyDTO } from "./hobby.dto";
import { Document, Types } from "mongoose";

export interface UserDTO extends Document {
  _id: Types.ObjectId;
  name: string;
  hobbies: HobbyDTO[] | Types.ObjectId[];
}
