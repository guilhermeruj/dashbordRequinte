const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const { Op } = require("sequelize");
const dataAjs = require("./functions/data");

//Models
const User = require("./models/User");
const Cliente = require("./models/Cliente");

const conn = require("./db/conn");
const moment = require("moment");

const bodyParser = require("body-parser");

// Inicia o express
const app = express();

//congigurando o bodyParser para receber os dados
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurando a session
app.use(
  session({
    secret: "my-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

//recebe os dados em json
app.use(express.json());

//configura o handlebars
app.engine(
  "handlebars",
  exphbs.engine({
    helpers: {
      eq: function (a, b) {
        return a === b;
      },
    },
  })
);
app.set("view engine", "handlebars");

//intica o css
app.use(express.static("public"));

//pagina de cadastro de usuario
app.get("/caduser", (req, res) => {
  res.render("caduser");
});

app.get("/perfil", (req, res) => {
  if (req.session.authenticated) {
    res.render("perfil", { user: req.session.user });
  } else {
    res.redirect("/login");
  }
});

app.post("/caduser/icluser", async (req, res) => {
  if (req.session.authenticated) {
    const { name, email, fone, password } = req.body;

    if (!name || !email || !fone || !password) {
      console.log("Dados vazios");
    }

    await User.create({ name, email, fone, password });

    res.redirect("/caduser");
  } else {
    res.redirect("/login");
  }
});

//cadastrar os agendamentos
app.get("/agendamentos", (req, res) => {
  if (req.session.authenticated) {
    res.render("agendamentos", { user: req.session.user });
  } else {
    // Se não estiver autenticado, redireciona para a página de login
    res.redirect("/login");
  }
});

app.post("/agendamentos/insertangd", async (req, res) => {
  if (req.session.authenticated) {
    const contrato = req.body.contrato;
    const cliente = req.body.cliente;
    const telefone = req.body.telefone;
    const situacao = req.body.situacao;
    const dataAgdProva = dataAjs(req.body.dataAgdProva);
    const dataAgdRetirada = dataAjs(req.body.dataAgdRetirada);
    const dataAgdDevolucao = dataAjs(req.body.dataAgdDevolucao);
    const horaProva = req.body.horaProva;
    const horaRetirada = req.body.horaRetirada;
    const horaDevolucao = req.body.horaDevolucao;
    const antecedencia = req.body.antecedencia;

    // Subtrai a quantidade de dias especificada em antecedencia
    const dataDisp = moment(dataAgd).subtract(antecedencia, "days").toDate();
    console.log(dataDisp);

    const tipo = "prova"
    const data = {
      contrato,
      cliente,
      telefone,
      tipo,
      situacao,
      dataAgdProva,
      dataAgdRetirada,
      dataAgdDevolucao,
      horaProva,
      horaRetirada,
      horaDevolucao,
      antecedencia,
      dataDisp,
    };
    console.log(data);
    await Cliente.create(data);
    res.redirect("/clientes");
  } else {
    // Se não estiver autenticado, redireciona para a página de login
    res.redirect("/login");
  }
});

app.post("/clientes/edit/:id", async (req, res) => {
  if (req.session.authenticated) {
    const id = req.params.id;
    const situacao = "Concluido";

    try {
      await Cliente.update({ situacao }, { where: { id: id } });
      res.redirect("/clientes");
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao atualizar o resgistro.");
    }
  } else {
    // Se não estiver autenticado, redireciona para a página de login
    res.redirect("/login");
  }
});

app.post("/editar/:id", async (req, res) => {
  if (req.session.authenticated) {
    const id = req.params.id;
    try {
      const pesquisa = await Cliente.findOne({ raw: true, where: { id: id } });
      res.render("editar", { pesquisa, user: req.session.user });
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao atualizar o resgistro.");
    }
  } else {
    // Se não estiver autenticado, redireciona para a página de login
    res.redirect("/login");
  }
});

app.get("/clientes", async (req, res) => {
  if (req.session.authenticated) {
    const pesquisa = await Cliente.findAll({ raw: true });

    const clientes = pesquisa.map((cliente) => {
      const dataFormatada = moment(cliente.dataAgd).format("DD/MM/YYYY");
      return { ...cliente, data: dataFormatada };
    });
    res.render("clientes", { clientes, user: req.session.user });
  } else {
    res.redirect("/login");
  }
});

app.post("/login/entrar", (req, res) => {
  //Receber os dados
  const { email, password } = req.body;

  //Verifica as credenciais no banco de dados
  User.findOne({
    where: {
      email: email,
      password: password,
    },
  })
    .then((user) => {
      if (user) {
        req.session.authenticated = true;
        req.session.user = user;

        //redireciona para o Dash
        res.redirect("/");
      } else {
        //Se estiver errado
        res.render("login", { err: "Email ou senha incorretos." });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Erro interno do servidor");
    });
});

//pagina principal
app.get("/login", (req, res) => {
  if (req.session.authenticated) {
    // Se estiver autenticado vai para o dash
    res.redirect("/");
  } else {
    // Se não estiver autenticado, exibi a página de login
    res.render("login", { layout: false });
  }
});

//pagina principal

app.get("/", async (req, res) => {
  if (req.session.authenticated) {
    try {
      const data = await Cliente.findAll();

      // Cálculo das informações
      const total = data.length;
      const concluidos = data.filter(
        (cliente) => cliente.situacao === "Concluido"
      ).length;
      const abertos = data.filter(
        (cliente) => cliente.situacao === "Aberto"
      ).length;
      const atrasados = data.filter(
        (cliente) =>
          moment(cliente.data).isBefore(moment(), "day") &&
          cliente.situacao !== "Concluido"
      ).length;
      const clientes = data.map((cliente) => {
        const dataFormatada = moment(cliente.data).format("DD/MM/YYYY");
        return { ...cliente.toJSON(), data: dataFormatada };
      });
      const percConcluidos = ((concluidos / total) * 100).toFixed(2);
      const percAbertos = ((abertos / total) * 100).toFixed(2);
      const percAtrasados = ((atrasados / total) * 100).toFixed(2);
      res.render("home", {
        total,
        concluidos,
        abertos,
        atrasados,
        clientes,
        percConcluidos,
        percAbertos,
        percAtrasados,
        user: req.session.user,
      });
    } catch (err) {
      console.log(err);
      res.render("error");
    }
  } else {
    res.redirect("/login");
  }
});

// Configurar a rota de logout
app.get("/logout", (req, res) => {
  // Destruir a sessão do usuário
  req.session.destroy();

  // Redirecionar para a página de login
  res.redirect("/login");
});

conn
  .sync()
  .then(() => {
    app.listen(3000);
    console.log("APP Rodando");
  })
  .catch((err) => console.log(err));
