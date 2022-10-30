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

const userApi = "/api/user/";

const user = { name: "fahmy", hobbies: [] };

const hobby = {
  name: "Play basketball",
  passionLevel: PassionLevel.HIGH,
  year: 1997,
};

describe(userApi, () => {
  describe("GET/", () => {
    it("should return empty array", async () => {
      const res = await request(server).get(userApi);
      expect(res.status).toEqual(200);
      expect(res.body).toEqual([]);
    });

    it("should return Array with one user", async () => {
      await User.insertMany([user]);
      const res = await request(server).get(userApi);
      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(1);
    });
  });

  describe("GET/:id", () => {
    it("should return an exception for an invalid ID", async () => {
      const res = await request(server).get("/api/user/1");
      expect(res.status).toEqual(400);
      expect(res.body.message).toEqual("Invalid Id");
    });

    it("should return an exception for a not found user", async () => {
      const id = new Types.ObjectId();
      const res = await request(server).get("/api/user/" + id);
      expect(res.status).toEqual(404);
      expect(res.body.message).toEqual("user not found!");
    });

    it("should return a user", async () => {
      const newUser = await new User(user).save();
      const res = await request(server).get("/api/user/" + newUser._id);
      expect(res.status).toEqual(200);
      expect(res.body._id).toEqual(newUser.id);
    });
  });

  describe("POST/", () => {
    it("should return an exception for an empty user name", async () => {
      const res = await request(server)
        .post(userApi)
        .send({ ...user, name: "" });
      expect(res.status).toEqual(400);
      expect(res.body.message).toEqual("must contain a name");
    });

    it("should return an exception for an non string user name", async () => {
      const res = await request(server)
        .post(userApi)
        .send({ ...user, name: 132 });
      expect(res.status).toEqual(400);
      expect(res.body.message).toEqual("name must be a string");
    });
  });

  describe("PUT/:id", () => {
    it("should return an exception for an empty passionLevel", async () => {
      const id = new Types.ObjectId();
      const res = await request(server)
        .put(userApi + id)
        .send({ ...hobby, passionLevel: "" });
      expect(res.status).toEqual(400);
      expect(res.body.message).toEqual("must contain a passionLevel");
    });

    it("should return an exception for an invalid passionLevel", async () => {
      const id = new Types.ObjectId();
      const res = await request(server)
        .put(userApi + id)
        .send({ ...hobby, passionLevel: "VERY_LOW" });
      expect(res.status).toEqual(400);
      expect(res.body.message).toEqual("passionLevel value is invalid");
    });

    it("should return a user with one hobby", async () => {
      const newUser = await new User(user).save();
      const res = await request(server)
        .put(userApi + newUser._id)
        .send(hobby);
      expect(res.status).toEqual(200);
      expect(res.body._id).toEqual(newUser.id);
      expect(res.body.hobbies.length).toBe(1);
    });
  });

  describe("DELETE/:id", () => {
    it("should return a deleted user", async () => {
      const newUser = await new User(user).save();
      const res = await request(server).delete(userApi + newUser.id);
      expect(res.status).toEqual(200);
      expect(res.body._id).toEqual(newUser.id);
    });

    it("should delete hobbies on cascade", async () => {
      const newHobby = await new Hobby(hobby).save();
      const newUser = await new User({
        ...user,
        hobbies: [newHobby._id],
      }).save();
      const hobbiesCount = await Hobby.find();
      expect(hobbiesCount.length).toBe(1);
      const res = await request(server).delete(userApi + newUser.id);
      expect(res.status).toEqual(200);
      expect(res.body._id).toEqual(newUser.id);
      const hobbies = await Hobby.find();
      expect(hobbies.length).toBe(0);
    });
  });
});
