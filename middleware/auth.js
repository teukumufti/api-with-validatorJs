const Db = require("../models");
const User = Db.user;
const Op = Db.Sequelize.Op;

module.exports = async function (req, res, next) {
  try {
    const token = req.headers["token"];

    if (token) {
      // check token
      let data_token = await User.findOne({ where: { email: token } });
      if (data_token) {
        req.session = {
          user_id: data_token.id,
        };
      } else {
        return res.status(200).json({
          code: 502,
          status: "error",
          message: ["Token not found."],
          result: [],
        });
      }
    } else {
      return res.status(200).json({
        code: 501,
        status: "error",
        message: ["Token is required."],
        result: [],
      });
    }

    next();
  } catch (err) {
    return res.status(200).json({
      code: 500,
      status: "error",
      message: [err.message],
      result: [],
    });
  }
};
