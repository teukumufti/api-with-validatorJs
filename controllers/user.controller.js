const Validator = require("validatorjs");
const Helpers = require("../helpers");
const Db = require("../models");
const User = Db.user;
const Op = Db.Sequelize.Op;

exports.lists = (req, res, next) => {
  // variable
  var { name, email, status, offset, limit, order, sort } = req.query;
  var message = [];

  offset = parseInt(offset) ? parseInt(offset) : 0;
  limit = parseInt(limit) ? parseInt(limit) : 20;
  order = order ? order : "created_at";
  sort = sort ? sort : "desc";

  // cek validation
  let rules = {
    email: "email",
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
      if (name) {
        name = name.trim();
        where.name = name;
      }

      if (email) {
        email = email.trim();
        where.email = email;
      }

      if (status) {
        status = status.trim();
        where.status = Helpers.getKeyByValue(Helpers.status_default(), status);
      }

      let data_user = await User.findAndCountAll({
        where: where,
        limit: limit,
        offset: offset,
        order: [[order, sort]],
      });

      let rest = Helpers.get_user(data_user.rows);

      res.status(200).json({
        code: 200,
        status: "success",
        message: ["fetch data success."],
        offset: offset,
        limit: limit,
        total: data_user.count,
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
      id: 'required|numeric'
  }
  let error_msg = {
      required: ':attribute cannot be null'
  }
  let validation = new Validator(req.query, rules, error_msg);
  validation.checkAsync(passes, fails);

  function fails() {   
      for (var key in validation.errors.all()) {
          var value = validation.errors.all()[key]
          message.push(value[0])
      } 
      res.status(200).json({
          code: 401,
          status: 'error',
          message: message,
          result: []
      });
  }

  async function passes() {
      // query
      let where = {}

      try {
          if(id) {
              id = id.trim()
              where.id = id
          }

          const data = await User.findOne({
              where:where
          })
  
          if(data) {
              let rest = Helpers.get_user([data])

              res.status(200).json({
                  code: 200,
                  status: 'success',
                  message: ['fetch data success.'],
                  result: rest
              });
          } else {
              res.status(200).json({
                  code: 404,
                  status: 'error',
                  message: ['data not found.'],
                  result: []
              });
          }
      } catch (err) {
          res.status(200).json({
              code: 400,
              status: 'error',
              message: [err.message],
              result: []
          });
      }
  }
}

exports.store = (req, res, next) => {
  // variable
  var { name, email } = req.body;
  var message = []

  // register validation cek db
  Validator.registerAsync('check_email', async function(email, attribute, req, passes) {
      let data = await User.findOne({
          where: { email: email, status: 1 }
      })

      if(data === null) {
          passes();
      } else {
          passes(false, 'Email already exist.');
      }
  });

  // cek validation
  let rules = {
      name: 'required|min:3',
      email: 'required|email|check_email',
  }
  let error_msg = {
      in: 'invalid :attribute'
  }

  let validation = new Validator(req.body, rules, error_msg);
  validation.checkAsync(passes, fails);

  function fails() {
      for (var key in validation.errors.all()) {
          var value = validation.errors.all()[key]
          message.push(value[0])
      }
      res.status(200).json({
          code: 401,
          status: 'error',
          message: message,
          result: []
      });
  }
  async function passes() {
      // query
      const id = Helpers.generate_id();
      const t = await Db.sequelize.transaction();

      try {
          let params = {};

          params.id = id;
          params.name = name;
          params.email = email;

          let rest = await User.create(params, {transaction: t});

          await t.commit();

          res.status(200).json({
              code: 200,
              status: 'success',
              message: ['store data success.'],
              result: rest
          })
      } catch (err) {
          await t.rollback();

          res.status(200).json({
              code: 400,
              status: 'error',
              message: [err.message],
              result: []
          });
      }
  }
}

exports.update = (req, res, next) => {
  // variable
  var { id, name, email, status } = req.body;
  var message = []

  // register validation cek db
  Validator.registerAsync('check_email', async function(email, attribute, req, passes) {
      let data = await User.findOne({
          where: { email: email, status: 1, id:{[Op.ne]: id} }
      })

      if(data === null) {
          passes();
      } else {
          passes(false, 'Email already exist on another user.');
      }
  });

  // cek validation
  let rules = {
      id: 'required|numeric',
      name: 'min:3',
      email: 'check_email',
      status: 'in:deleted,actived,inactived,banned'
  }
  let error_msg = {
      required: ':attribute cannot be null',
      in: "invalid :attribute"
  }
  let validation = new Validator(req.body, rules, error_msg);
  validation.checkAsync(passes, fails);

  function fails() {
      for (var key in validation.errors.all()) {
          var value = validation.errors.all()[key]
          message.push(value[0])
      } 
      return res.status(200).json({
          code: 401,
          status: 'error',
          message: message,
          result: []
      });
  }
  async function passes() {
      // query
      let params = {}
      const t = await Db.sequelize.transaction();

      try {
          if(name) {
              name = name.trim()
              params.name = name
          }
          if(email) {
              email = email.trim()
              params.email = email
          }
          if(status) {
              status = status.trim()
              params.status = Helpers.getKeyByValue(Helpers.status_default(), status);
          }

          // update
          let rest = await User.update(params,{where:{id:id},transaction: t})

          await t.commit();

          res.status(200).json({
              code: 200,
              status: 'success',
              message: ['update data success.'],
              result: rest
          });
          
      } catch (error) {
          await t.rollback();

          res.status(200).json({
              code: 400,
              status: 'error',
              message: [error.message],
              result: []
          });
      }
      
  }
}

exports.destroy = (req, res, next) => {
  // variable
  var { id } = req.body;
  var message = []

  // cek validation
  let rules = {
      id: 'required|numeric'
  }
  let error_msg = {
      required: ':attribute cannot be null',
      in: "invalid :attribute"
  }
  let validation = new Validator(req.body, rules, error_msg);
  validation.checkAsync(passes, fails);

  function fails() {
      for (var key in validation.errors.all()) {
          var value = validation.errors.all()[key]
          message.push(value[0])
      } 
      return res.status(200).json({
          code: 401,
          status: 'error',
          message: message,
          result: []
      });
  }
  async function passes() {
      // query
      let params = {}
      const t = await Db.sequelize.transaction();

      try {
          // delete
          let rest = await User.destroy({where:{id:id},transaction: t})

          await t.commit();

          res.status(200).json({
              code: 200,
              status: 'success',
              message: ['destroy data success.'],
              result: rest
          });
          
      } catch (error) {
          await t.rollback();

          res.status(200).json({
              code: 400,
              status: 'error',
              message: [error.message],
              result: []
          });
      }
      
  }
}
 

