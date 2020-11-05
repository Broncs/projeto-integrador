//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const moment = require("moment");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

mongoose.connect("mongodb://localhost:27017/LookDivaDB");

// Schema para cliente
const clienteSchema = new mongoose.Schema({
  cliente: { type: String, required: true },
  email: { type: String, required: true },
  telefone: { type: Number, required: false },
  whats: { type: Number, required: true },
});

// mongoose model
const Cliente = mongoose.model("Cliente", clienteSchema);

// Schema para ordem de serviço
const servicoSchema = new mongoose.Schema({
  cliente: String,
  descricao: String,
  defeito: String,
  valor: Number,
  data: Date,
});

// mongoose model
const Servico = mongoose.model("Servico", servicoSchema);

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  Servico.find({}, (err, foundOrders) => {
    if (err) {
      console.log(err);
    } else {
      res.render("servicos", { servicos: foundOrders, moment: moment });
    }
  });
});

app.get("/ordemServico", (req, res) => {
  res.render("ordemServico");
});

app.post("/ordemServico", (req, res) => {
  const servico = new Servico({
    cliente: req.body.cliente,
    descricao: req.body.descricao,
    defeito: req.body.defeito,
    valor: Number(req.body.valor),
    data: Date.parse(req.body.data),
  });

  servico.save((err) => {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.get("/clientes", (req, res) => {
  Cliente.find({}, (err, foundClients) => {
    res.render("listaClientes", {
      posts: foundClients,
    });
  });
});

app.get("/cadastrarCliente", (req, res) => {
  res.render("cadastrarCliente");
});

app.post("/cadastrarCliente", (req, res) => {
  const nome = req.body.nome;

  if (nome.length > 2 && nome.length < 15) {
    const cliente = new Cliente({
      cliente: req.body.nome,
      email: req.body.email,
      telefone: req.body.telefone,
      whats: req.body.whatapp,
    });
    cliente.save((err) => {
      if (!err) {
        res.redirect("/clientes");
      }
    });
  } else {
    console.log("errorrr");
  }
});

app.post("/deletecliente", (req, res) => {
  const deleteClientId = req.body.delete;
  Cliente.findByIdAndRemove(deleteClientId, (err) => {
    if (!err) {
      res.redirect("/clientes");
    }
  });
});

app.post("/delete", (req, res) => {
  const deleteItemId = req.body.delete;
  Servico.findByIdAndRemove(deleteItemId, (err) => {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.get("/servicos/:clientId", (req, res) => {
  const ordemServico = req.params.clientId;

  Servico.findById({ _id: ordemServico }, (err, ordemFound) => {
    res.render("post", { servico: ordemFound, moment: moment });
  });
});

app.get("/clientes/editar/:clientId", (req, res) => {
  const clientId = req.params.clientId;

  Cliente.findById({ _id: clientId }, (err, clienteFound) => {
    res.render("editarclient", { cliente: clienteFound });
  });
});

app.post("/clientes/editar", (req, res) => {
  const clienteId = req.body.confirmar;

  Cliente.updateOne(
    { _id: clienteId },
    {
      cliente: req.body.nome,
      email: req.body.email,
      telefone: req.body.telefone,
      whats: req.body.whatsapp,
    },
    (err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/clientes");
      }
    }
  );
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
