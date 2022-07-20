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
  return Math.floor(Date.now() *Math.random())
}

module.exports = {
  get_user,
  status_default,
  getKeyByValue,
  getValueByKey,
  generate_id,
};
