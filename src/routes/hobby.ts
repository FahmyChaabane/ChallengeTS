import { HobbyDTO } from "./../interfaces/hobby.dto";
import { asyncHandler } from "./../middlewares/asyncHandler";
import express, { Request, Response } from "express";
import Hobby from "../models/hobby.schema";
import User from "../models/user.schema";
import HttpException from "../exceptions/httpException";
import { param } from "express-validator";

const route = express.Router();

type HobbyReturnDto = HobbyDTO | null;

route.delete(
  "/:hobbyId/:userId",
  param("hobbyId").isMongoId().withMessage("Invalid hobbyId"),
  param("userId").isMongoId().withMessage("Invalid userId"),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.userId);
    if (!user) {
      throw new HttpException(404, "user not found!");
    }
    const hobby: HobbyReturnDto = await Hobby.findById(req.params.hobbyId);
    if (!hobby) {
      throw new HttpException(404, "hobby not found!");
    }

    if (!user.hobbies.includes(hobby.id)) {
      throw new HttpException(400, "user does not have the specified hobby!");
    }

    await hobby.remove();
    user.hobbies = user.hobbies.filter(
      (h) => h._id.toString() !== hobby._id.toString()
    );
    await user.save();
    res.send(hobby);
  })
);

export default route;
