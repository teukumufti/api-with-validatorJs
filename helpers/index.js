const moment = require("moment");

function get_user(data) {
  var rv = [];

  Object.values(data).forEach(function (key, index) {
    rv[index] = {
      id: key.id.toString(),
      name: key.name,
      email: key.email,
      status: getValueByKey(status_default(), key.status),
      created_at: moment(key.createdAt).format("YYYY-MM-DD HH:mm:ss"),
      updated_at: moment(key.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
    };
  });

  return rv;
}

function get_product(data) {
  var rv = [];

  Object.values(data).forEach(function (key, index) {
    rv[index] = {
      id: key.id.toString(),
      product_name: key.product_name,
      product_category: key.product_category,
      product_desc: key.product_desc,
      product_image: key.product_image,
      product_qty: key.product_qty,
      created_at: moment(key.createdAt).format("YYYY-MM-DD HH:mm:ss"),
      updated_at: moment(key.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
    };
  });

  return rv;
}

function get_transaction(data) {
  var rv = [];

  Object.values(data).forEach(function (key, index) {
    rv[index] = {
      id: key.id.toString(),
      id_product: key.id_product,
      id_buyer: key.id_buyer,
      id_seller: key.id_seller,
      price: key.price,
      status: key.status,
      created_at: moment(key.createdAt).format("YYYY-MM-DD HH:mm:ss"),
      updated_at: moment(key.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
    };
  });

  return rv;
}

function status_default() {
  return { 0: "deleted", 1: "actived", 2: "inactived", 3: "banned" };
}

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

function getValueByKey(object, value) {
  return Object.values(object).find((key) => object[value] === key);
}

function generate_id() {
  return Math.floor(Date.now() * Math.random());
}

module.exports = {
  get_user,
  get_product,
  get_transaction,
  status_default,
  getKeyByValue,
  getValueByKey,
  generate_id,
};
