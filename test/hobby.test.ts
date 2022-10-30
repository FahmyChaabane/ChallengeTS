import Hobby, { PassionLevel } from "../src/models/hobby.schema";
import { Server } from "http";
import {
  describe,
  expect,
  beforeEach,
  afterEach,
  afterAll,
  it,
} from "@jest/globals";
import { disconnect, Types } from "mongoose";
import request from "supertest";
import srv from "../src/index";
import User from "../src/models/user.schema";

let server: Server;
beforeEach(() => {
  server = srv;
});

afterEach(async () => {
  await User.collection.deleteMany({});
  await Hobby.collection.deleteMany({});
  server.close();
});

afterAll(() => disconnect());

const hobbyApi = "/api/hobby/";

const user = { name: "fahmy", hobbies: [] };

const hobby = {
  name: "Play basketball",
  passionLevel: PassionLevel.HIGH,
  year: 1997,
};

describe(hobbyApi, () => {
  describe("DELETE/:hobbyId/:userId", () => {
    it("should return an exception for a not found hobby", async () => {
      const newUser = await new User(user).save();
      const id = new Types.ObjectId();
      const res = await request(server).delete(
        hobbyApi + id + "/" + newUser.id
      );
      expect(res.status).toEqual(404);
      expect(res.body.message).toEqual("hobby not found!");
    });

    it("should return an exception for unowned hobby", async () => {
      const newHobby = await new Hobby(hobby).save();
      const id = new Types.ObjectId();
      const newUser = await new User({
        ...user,
        hobbies: [id],
      }).save();

      const res = await request(server).delete(
        hobbyApi + newHobby.id + "/" + newUser.id
      );
      expect(res.status).toEqual(400);
      expect(res.body.message).toEqual(
        "user does not have the specified hobby!"
      );
    });

    it("should return a deleted hobby", async () => {
      const newHobby = await new Hobby(hobby).save();
      const newUser = await new User({
        ...user,
        hobbies: [newHobby.id],
      }).save();

      const res = await request(server).delete(
        hobbyApi + newHobby.id + "/" + newUser.id
      );
      expect(res.status).toEqual(200);
      expect(res.body._id).toEqual(newHobby.id);
    });
  });
});
