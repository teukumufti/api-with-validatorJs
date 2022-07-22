const Validator = require("validatorjs");
const Helpers = require("../helpers");
const Db = require("../models");
const Transaction = Db.transaction;
const Op = Db.Sequelize.Op;

exports.lists = (req, res, next) => {
  // variable
  var {
    id_product,
    id_buyer,
    id_seller,
    price,
    status,
    offset,
    limit,
    order,
    sort,
  } = req.query;
  var message = [];

  offset = parseInt(offset) ? parseInt(offset) : 0;
  limit = parseInt(limit) ? parseInt(limit) : 20;
  order = order ? order : "created_at";
  sort = sort ? sort : "desc";

  // cek validation
  let rules = {
    id_product: "idProduct",
  };
  let error_msg = {
    in: "invalid :attribute",
  };
  let validation = new Validator(req.query, rules, error_msg);
  validation.checkAsync(passes, fails);

  function fails() {
    for (var key in validation.errors.all()) {
      var value = validation.errors.all()[key];
      message.push(value[0]);
    }
    res.status(200).json({
      code: 401,
      status: "error",
      message: message,
      offset: offset,
      limit: limit,
      total: 0,
      result: [],
    });
  }

  async function passes() {
    // query
    let where = {};

    try {
      if (id_product) {
        id_product = id_product.trim();
        where.product = id_product;
      }

      if (id_buyer) {
        id_buyer = id_buyer.trim();
        where.buyer = id_buyer;
      }
      if (id_seller) {
        id_seller = id_seller.trim();
        where.seller = id_seller;
      }
      if (price) {
        price = price.trim();
        where.price = price;
      }
      if (status) {
        status = status.trim();
        where.status = status;
      }

      let data_transaction = await Transaction.findAndCountAll({
        where: where,
        limit: limit,
        offset: offset,
        order: [[order, sort]],
      });
      let rest = Helpers.get_transaction(data_transaction.rows);

      res.status(200).json({
        code: 200,
        status: "success",
        message: ["fetch data success."],
        offset: offset,
        limit: limit,
        total: data_transaction.count,
        result: rest,
      });
    } catch (err) {
      res.status(200).json({
        code: 400,
        status: "error",
        message: [err.message],
        offset: offset,
        limit: limit,
        total: 0,
        result: [],
      });
    }
  }
};

exports.info = (req, res, next) => {
  // variable
  var { id } = req.query;
  var message = [];

  // cek validation
  let rules = {
    id: "required|numeric",
  };
  let error_msg = {
    required: ":attribute cannot be null",
  };
  let validation = new Validator(req.query, rules, error_msg);
  validation.checkAsync(passes, fails);

  function fails() {
    for (var key in validation.errors.all()) {
      var value = validation.errors.all()[key];
      message.push(value[0]);
    }
    res.status(200).json({
      code: 401,
      status: "error",
      message: message,
      result: [],
    });
  }

  async function passes() {
    // query
    let where = {};

    try {
      if (id) {
        id = id.trim();
        where.id = id;
      }

      const data = await Transaction.findOne({
        where: where,
      });

      if (data) {
        let rest = Helpers.get_transaction([data]);

        res.status(200).json({
          code: 200,
          status: "success",
          message: ["fetch data success."],
          result: rest,
        });
      } else {
        res.status(200).json({
          code: 404,
          status: "error",
          message: ["data not found."],
          result: [],
        });
      }
    } catch (err) {
      res.status(200).json({
        code: 400,
        status: "error",
        message: [err.message],
        result: [],
      });
    }
  }
};

exports.store = (req, res, next) => {
  // variable
  var { id_product, id_buyer, id_seller, price, status } = req.body;
  var message = [];

  // validation cek db
  //   Validator.registerAsync(
  //     "check_idBuyer",
  //     async function (idBuyer, attribute, req, passes) {
  //       let data = await Transaction.findOne({
  //         where: { idBuyer: idBuyer },
  //       });

  //       if (data === null) {
  //         passes();
  //       } else {
  //         passes(false, "transaction already exist.");
  //       }
  //     }
  //   );

  //   cek validation
  //   let rules = {
  //     idBuyer: "check_idBuyer",
  //   };
  //   let error_msg = {
  //     in: "invalid :attribute",
  //   };

  let validation = new Validator(req.body);
  validation.checkAsync(passes, fails);

  function fails() {
    for (var key in validation.errors.all()) {
      var value = validation.errors.all()[key];
      message.push(value[0]);
    }
    res.status(200).json({
      code: 401,
      status: "error",
      message: message,
      result: [],
    });
  }
  async function passes() {
    // query
    const id = Helpers.generate_id();
    const t = await Db.sequelize.transaction();

    try {
      let params = {};
      params.id = id;
      params.id_product = id_product;
      params.id_buyer = id_buyer;
      params.id_seller = id_seller;
      params.price = price;
      params.status = status;

      let rest = await Transaction.create(params, { transaction: t });
      await t.commit();

      res.status(200).json({
        code: 200,
        status: "success",
        message: ["store data success."],
        result: rest,
      });
    } catch (err) {
      await t.rollback();

      res.status(200).json({
        code: 400,
        status: "error",
        message: [err.message],
        result: [],
      });
    }
  }
};

exports.destroy = (req, res, next) => {
  // variable
  var { id } = req.body;
  var message = [];

  // cek validation
  let rules = {
    id: "required|numeric",
  };
  let error_msg = {
    required: ":attribute cannot be null",
    in: "invalid :attribute",
  };
  let validation = new Validator(req.body, rules, error_msg);
  validation.checkAsync(passes, fails);

  function fails() {
    for (var key in validation.errors.all()) {
      var value = validation.errors.all()[key];
      message.push(value[0]);
    }
    return res.status(200).json({
      code: 401,
      status: "error",
      message: message,
      result: [],
    });
  }
  async function passes() {
    // query
    let params = {};
    const t = await Db.sequelize.transaction();

    try {
      // delete
      let rest = await Transaction.destroy({
        where: { id: id },
        transaction: t,
      });

      await t.commit();

      res.status(200).json({
        code: 200,
        status: "success",
        message: ["destroy data success."],
        result: rest,
      });
    } catch (error) {
      await t.rollback();

      res.status(200).json({
        code: 400,
        status: "error",
        message: [error.message],
        result: [],
      });
    }
  }
};
