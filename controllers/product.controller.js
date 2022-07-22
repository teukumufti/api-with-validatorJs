const Validator = require("validatorjs");
const Helpers = require("../helpers");
const Db = require("../models");
const Product = Db.product;
const Op = Db.Sequelize.Op;

exports.lists = (req, res, next) => {
  // variable
  var {
    product_name,
    product_category,
    product_desc,
    product_image,
    product_qty,
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
    product_name: "product_name",
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
      if (product_name) {
        product_name = product_name.trim();
        where.name = product_name;
      }

      if (product_category) {
        product_category = product_category.trim();
        where.category = product_category;
      }

      if (product_desc) {
        product_desc = product_desc.trim();
        where.desc = product_desc;
      }
      if (product_image) {
        product_image = product_image.trim();
        where.image = product_image;
      }
      if (product_qty) {
        product_qty = product_qty.trim();
        where.qty = product_qty;
      }

      let data_product = await Product.findAndCountAll({
        where: where,
        limit: limit,
        offset: offset,
        order: [[order, sort]],
      });
      let rest = Helpers.get_product(data_product.rows);

      res.status(200).json({
        code: 200,
        status: "success",
        message: ["fetch data success."],
        offset: offset,
        limit: limit,
        total: data_product.count,
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

      const data = await Product.findOne({
        where: where,
      });

      if (data) {
        let rest = Helpers.get_product([data]);

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
  console.log(req.file);
  // variable
  var {
    product_name,
    product_category,
    product_desc,
    product_image,
    product_qty,
  } = req.body;
  var message = [];

  // product validation cek db
  Validator.registerAsync(
    "check_product",
    async function (product_name, attribute, req, passes) {
      let data = await Product.findOne({
        where: { product_name: product_name },
      });

      if (data === null) {
        passes();
      } else {
        passes(false, "Product already exist.");
      }
    }
  );

  // cek validation
  let rules = {
    product_name: "check_product",
  };
  let error_msg = {
    in: "invalid :attribute",
  };

  let validation = new Validator(req.body, rules, error_msg);
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
    var imgsrc = "http://127.0.0.1:3000/images/" + req.file.filename;

    try {
      let params = {};
      params.id = id;
      params.product_name = product_name;
      params.product_category = product_category;
      params.product_desc = product_desc;
      params.product_image = imgsrc;
      params.product_qty = product_qty;

      let rest = await Product.create(params, { transaction: t });
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

exports.update = (req, res, next) => {
  // variable
  var {
    id,
    product_name,
    product_category,
    product_desc,
    product_image,
    product_qty,
  } = req.body;
  var message = [];

  Validator.registerAsync(
    "check_product",
    async function (product_name, attribute, req, passes) {
      let data = await Product.findOne({
        where: { product_name: product_name },
      });

      if (data === null) {
        passes();
      } else {
        passes(false, "Product already exist. on another product name");
      }
    }
  );

  // cek validation
  let rules = {
    id: "required|numeric",
    product_name: "check_product",
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
      if (product_name) {
        product_name = product_name.trim();
        params.product_name = product_name;
      }

      if (product_category) {
        product_category = product_category.trim();
        params.product_category = product_category;
      }

      if (product_desc) {
        product_desc = product_desc.trim();
        params.product_desc = product_desc;
      }
      if (product_image) {
        product_image = product_image.trim();
        params.product_image = product_image;
      }
      if (product_qty) {
        product_qty = product_qty.trim();
        params.product_qty = product_qty;
      }

      // update
      let rest = await Product.update(params, {
        where: { id: id },
        transaction: t,
      });

      await t.commit();

      res.status(200).json({
        code: 200,
        status: "success",
        message: ["update data success."],
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
      let rest = await Product.destroy({ where: { id: id }, transaction: t });

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
