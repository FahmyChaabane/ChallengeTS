import { Schema, model } from "mongoose";

export enum PassionLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  VERY_HIGH = "VERY_HIGH",
}

export interface IHobby {
  passionLevel: PassionLevel;
  name: string;
  year: number;
}

const hobbySchema = new Schema<IHobby>({
  passionLevel: { type: String, required: true },
  name: { type: String, required: true },
  year: { type: Number, required: true },
});

const Hobby = model<IHobby>("Hobby", hobbySchema);

export default Hobby;
