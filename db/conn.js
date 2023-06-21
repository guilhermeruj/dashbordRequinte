const { Sequelize } = require("sequelize");

// const sequelize = new Sequelize(
//   "requinte_disp",
//   "guilhermerosa",
//   "Uu232336364",
//   {
//     host: "localhost",
//     dialect: "mysql",
//   }
// );

// try {
//   console.log("Conectamos ao Mysql");
// } catch (error) {
//   console.log("Não conectou");
// }

const sequelize = new Sequelize("requinte_disp", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

try {
  console.log("Conectamos ao Mysql");
} catch (error) {
  console.log("Não conectou");
}

module.exports = sequelize;
