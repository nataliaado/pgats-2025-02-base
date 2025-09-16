const request = require("supertest");
const { expect } = require("chai");
require("dotenv").config();

const loginUser = require("../fixture/requisicoes/login/loginUser.json");
const checkoutValido = require("../fixture/requisicoes/checkout/validarCheckoutValido.json");
const respostaPaymentValido = require("../fixture/respostas/checkout/verificarPaymentMethod.json");
const respostaTokenInvalido = require("../fixture/respostas/checkout/tokenInvalido.json");
const checkoutComErro = require("../fixture/requisicoes/checkout/validarCheckoutComErro.json");
const respostaErroCheckout = require("../fixture/respostas/checkout/erroNoCheckout.json");

describe("GRAPHQL - Checkout via HTTP", () => {
  beforeEach(async () => {
    const respostaLogin = await request(process.env.BASE_URL_GRAPHQL)
      .post("/graphql")
      .send(loginUser);

    token = respostaLogin.body.data.login.token;
  });

  it("Quando informo dados válidos, realiza o checkout com sucesso, com status 200, via HTTP", async () => {
    const resposta = await request(process.env.BASE_URL_GRAPHQL)
      .post("/graphql")
      .set("authorization", `Bearer ${token}`)
      .send(checkoutValido);

    expect(resposta.status).to.equal(200);
    expect(resposta.body).to.deep.equal(respostaPaymentValido);
  });

  it("Quando realizo checkout sem o Token, recebo mensagem de erro, Token Inválido, via HTTP", async () => {
    const resposta = await request(process.env.BASE_URL_GRAPHQL)
      .post("/graphql")
      .send(checkoutValido);

    expect(resposta.status).to.equal(200);
    expect(resposta.body.errors[0].message).to.equal(
      respostaTokenInvalido.errors[0].message
    );
  });

  it("Validar mensagem de erro produto não encontrado, via HTTP", async () => {
    const resposta = await request(process.env.BASE_URL_GRAPHQL)
      .post("/graphql")
      .send(checkoutComErro)
      .set("authorization", `Bearer ${token}`);

    expect(resposta.status).to.equal(200);
    expect(resposta.body.errors[0].message).to.equal(
      respostaErroCheckout.errors[0].message
    );
  });
});
