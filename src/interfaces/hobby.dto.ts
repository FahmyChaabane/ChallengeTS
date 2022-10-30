import { Document } from "mongoose";
import { PassionLevel } from "../models/hobby.schema";

export interface HobbyDTO extends Document {
  passionLevel: PassionLevel;
  name: string;
  year: string;
}
