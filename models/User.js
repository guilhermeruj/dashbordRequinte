// Importar os tipos do sequelize
const { DataTypes } = require("sequelize");
// Importar o banco
const db = require("../db/conn");
const User = db.define("user", {
  name: {
    type: DataTypes.STRING,
    require: true,
  },
  email: {
    type: DataTypes.STRING,
    require: true,
  },
  fone: {
    type: DataTypes.STRING,
    require: true,
  },
  password: {
    type: DataTypes.STRING,
    require: true,
  },
});
module.exports = User;
