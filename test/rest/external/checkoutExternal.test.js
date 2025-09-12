const request = require("supertest");
const { expect } = require("chai");
require("dotenv").config();

const loginUser = require("../fixture/requisicoes/login/loginUser.json");
const checkoutValido = require("../fixture/requisicoes/checkout/validarCheckoutValido.json");
const respostaTokenInvalido = require("../fixture/respostas/checkout/tokenInvalido.json");
const checkoutComErro = require("../fixture/requisicoes/checkout/validarCheckoutComErro.json");
const respostaErroCheckout = require("../fixture/respostas/checkout/erroNoCheckout.json");

describe("REST - Checkout via HTTP", () => {
  before(async () => {
    const resposta = await request(process.env.BASE_URL_REST)
      .post("/api/users/login")
      .send(loginUser);

    token = resposta.body.token;
  });

  it("Quando informo dados válidos, realiza o checkout com sucesso, com status 200, via HTTP", async () => {
    const resposta = await request(process.env.BASE_URL_REST)
      .post("/api/checkout")
      .set("authorization", `Bearer ${token}`)
      .send(checkoutValido);

    expect(resposta.status).to.equal(200);
  });

  it("Quando realizo checkout sem o Token, recebo mensagem de erro e status 401, via HTTP", async () => {
    const resposta = await request(process.env.BASE_URL_REST)
      .post("/api/checkout")
      .send(checkoutValido);

    expect(resposta.status).to.equal(401);
    expect(resposta.body).to.deep.equal(respostaTokenInvalido);
  });

  it("Validar Produto não encontrado, status 400, via HTTP", async () => {
    const resposta = await request(process.env.BASE_URL_REST)
      .post("/api/checkout")
      .send(checkoutComErro)
      .set("authorization", `Bearer ${token}`);

    expect(resposta.status).to.equal(400);
    expect(resposta.body).to.deep.equal(respostaErroCheckout);
  });
});
