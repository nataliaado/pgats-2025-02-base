const request = require("supertest");
const sinon = require("sinon");
const { expect } = require("chai");

const app = require("../../../graphql/app");

const checkoutService = require("../../../src/services/checkoutService");
const loginUser = require("../fixture/requisicoes/login/loginUser.json");
const checkoutValido = require("../fixture/requisicoes/checkout/validarCheckoutValido.json");
const respostaPaymentValido = require("../fixture/respostas/checkout/verificarPaymentMethod.json");
const respostaTokenInvalido = require("../fixture/respostas/checkout/tokenInvalido.json");
const respostaErroCartaoObrigatorio = require("../fixture/respostas/checkout/erroCartaoObrigatorio.json");

describe("GRAPHQL - Checkout Controller", () => {
  beforeEach(async () => {
    const respostaLogin = await request(app).post("/graphql").send(loginUser);

    token = respostaLogin.body.data.login.token;
  });

  it("Quando informo dados válidos, realiza o checkout com sucesso, com status 200", async () => {
    const resposta = await request(app)
      .post("/graphql")
      .set("authorization", `Bearer ${token}`)
      .send(checkoutValido);

    expect(resposta.status).to.equal(200);
    expect(resposta.body).to.deep.equal(respostaPaymentValido);
  });

  it("Quando realizo checkout sem o Token, recebo mensagem de erro, Token Inválido", async () => {
    const resposta = await request(app).post("/graphql").send(checkoutValido);

    expect(resposta.status).to.equal(200);
    expect(resposta.body.errors[0].message).to.equal(
      respostaTokenInvalido.errors[0].message
    );
  });

  it("Usando Mock: Validar mensagem de erro cartão obrigatório", async () => {
    const checkoutServiceMock = sinon.stub(checkoutService, "checkout");
    checkoutServiceMock.throws(
      new Error(respostaErroCartaoObrigatorio.errors[0].message)
    );
    const resposta = await request(app)
      .post("/graphql")
      .set("authorization", `Bearer ${token}`)
      .send(checkoutValido);

    expect(resposta.status).to.equal(200);
    expect(resposta.body.errors[0].message).to.equal(
      respostaErroCartaoObrigatorio.errors[0].message
    );
  });

  afterEach(() => {
    sinon.restore();
  });
});
