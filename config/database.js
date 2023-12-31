const mongoose = require("mongoose");
require("dotenv").config();

exports.dbConnect = async () => {
  try {
    const URL = process.env.DATABASE_URL;

    await mongoose.connect(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("SERVER ONLINE. ✔️");
  } catch (error) {
    if (error) throw error;
    process.exit(1);
  }
};
