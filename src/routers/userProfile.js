const express = require("express");
const UserProfile = require("../models/userProfile.js");
const auth = require("../middleware/auth");
const router = new express.Router();

// Create Profile
router.post("/profile", auth, async (req, res) => {
  const profile = new UserProfile({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await profile.save();
    res.status(201).send(profile);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Update Profile
router.patch("/profile", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedupdates = ["name", "age"];
  const isValidOperation = updates.every((update) =>
    allowedupdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ Error: "Invalid Update!" });
  }

  try {
    const profile = await UserProfile.findOne({
      owner: req.user._id,
    });

    if (!profile) {
      return res.status(404).send();
    }

    updates.forEach((update) => (profile[update] = req.body[update]));
    await profile.save();

    res.send(profile);
  } catch (e) {
    res.status(400).send();
  }
});

// profile image upload
const upload = multer({
  limits: {
    fileSize: 1000000, //size in bytes
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload jpg/jpeg/png file"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/userprofile/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer(); //resizing the image to std size in server, again we have to do the same cropping on FE too.

    const profile = await UserProfile.findOne({
      owner: req.user._id,
    });
    profile.avatar = buffer;
    await profile.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

module.exports = router;
