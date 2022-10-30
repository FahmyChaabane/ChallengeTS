import { UserDTO } from "./../interfaces/user.dto";
import { asyncHandler } from "./../middlewares/asyncHandler";
import express, { Request, Response } from "express";
import Hobby, { PassionLevel } from "../models/hobby.schema";
import User from "../models/user.schema";
import { body, param } from "express-validator";
import HttpException from "../exceptions/httpException";

const route = express.Router();

type UserReturnDto = UserDTO | null;

route.get(
  "/",
  asyncHandler(async (_: Request, res: Response) => {
    const result: UserReturnDto[] = await User.find();
    res.send(result);
  })
);

route.get(
  "/:id",
  param("id").isMongoId().withMessage("Invalid Id"),
  asyncHandler(async (req: Request, res: Response) => {
    const user: UserReturnDto = await User.findById(req.params.id)
      .populate("hobbies")
      .exec();
    if (!user) {
      throw new HttpException(404, "user not found!");
    }
    res.send(user);
  })
);

route.post(
  "/",
  body("name")
    .notEmpty()
    .withMessage("must contain a name")
    .isString()
    .withMessage("name must be a string"),
  asyncHandler(async (req: Request, res: Response) => {
    const user = new User({
      name: req.body.name,
    });
    const result: UserReturnDto = await user.save();
    res.send(result);
  })
);

route.put(
  "/:id",
  param("id").isMongoId().withMessage("Invalid Id"),
  body("name")
    .notEmpty()
    .withMessage("must contain a name")
    .isString()
    .withMessage("name must be a string"),
  body("year")
    .notEmpty()
    .withMessage("must contain a year")
    .isNumeric()
    .withMessage("year must be a numeric"),
  body("passionLevel")
    .notEmpty()
    .withMessage("must contain a passionLevel")
    .isString()
    .withMessage("passionLevel must be a string")
    .isIn([
      PassionLevel.LOW,
      PassionLevel.MEDIUM,
      PassionLevel.HIGH,
      PassionLevel.VERY_HIGH,
    ])
    .withMessage("passionLevel value is invalid"),
  asyncHandler(async (req: Request, res: Response) => {
    const user: UserReturnDto = await User.findById(req.params.id);
    if (!user) {
      throw new HttpException(404, "user not found!");
    }
    const hobby = new Hobby({
      name: req.body.name,
      year: req.body.year,
      passionLevel: req.body.passionLevel,
    });
    await hobby.save();
    user.hobbies.push(hobby.id);
    const result: UserReturnDto = await user.save();
    res.send(result);
  })
);

route.delete(
  "/:id",
  param("id").isMongoId().withMessage("Invalid Id"),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new HttpException(404, "user not found!");
    }
    await user.remove();
    res.send(user);
  })
);

export default route;
