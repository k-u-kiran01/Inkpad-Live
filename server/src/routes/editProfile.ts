import { Router } from "express";
import User from "../../db/models/User";
import mongoose from "mongoose";

const editProfile = Router();

editProfile.post("/", async (req, res, next) => {
  const { formDetails, oldEmail } = req.body;

  const { email, username, name } = formDetails;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findOne({ email: oldEmail });
    let updatedUser;
    if (user?.googleId) {
      updatedUser = await User.findOneAndUpdate(
        { email: oldEmail },
        { $set: { name: name, username: username } },
        { new: true ,session}
      );
    } else {
      updatedUser = await User.findOneAndUpdate(
        { email: oldEmail },
        { $set: { name: name, email: email, username: username } },
        { new: true ,session}
      );
    }
    if (!updatedUser) {
      session.abortTransaction();
      session.endSession();
      res.status(400).json({ message: "user not found" });
    }
    // console.log(updatedUser);

    session.commitTransaction();
    session.endSession();
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    next(error);
  }
});

editProfile.get("/check-username", async (req, res, next) => {
  try {
    const username = req.query.username as string;
    const existing = await User.findOne({ username }).lean();
    res.json({ available: !existing });
  } catch (error) {
    next(error);
  }
});

editProfile.get("/check-email", async (req, res, next) => {
  try {
    const email = req.query.email as string;
    // console.log(email)
    const existing = await User.findOne({ email }).lean();
    res.json({ available: !existing });
  } catch (error) {
    next(error);
  }
});
export default editProfile;
