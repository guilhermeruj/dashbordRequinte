// Importar o sequelize para gerenciar o banco
const { DataTypes } = require("sequelize");

// Importar o conector do banco
const db = require("../db/conn");

const Clientes = db.define("clientes", {
  contrato: {
    type: DataTypes.INTEGER,
    require: true,
  },
  cliente: {
    type: DataTypes.STRING,
    require: true,
  },
  telefone: {
    type: DataTypes.STRING,
    require: true,
  },
  tipo: {
    type: DataTypes.STRING,
    require: true,
  },
  situacao: {
    type: DataTypes.STRING,
    require: true,
  },
  dataAgdProva: {
    type: DataTypes.DATEONLY,
    require: true,
  },
  dataAgdRetirada: {
    type: DataTypes.DATEONLY,
    require: true,
  },
  dataAgdDevolucao: {
    type: DataTypes.DATEONLY,
    require: true,
  },
  horaProva: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  horaRetirada: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  horaDevolucao: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  antecedencia: {
    type: DataTypes.INTEGER,
    require: true,
  },
  dataDisp: {
    type: DataTypes.DATEONLY,
    require: true,
  },
});
module.exports = Clientes;
