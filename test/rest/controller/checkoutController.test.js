const request = require("supertest");
const sinon = require("sinon");
const { expect } = require("chai");

const app = require("../../../rest/app");

const loginUser = require("../fixture/requisicoes/login/loginUser.json");
const checkoutService = require("../../../src/services/checkoutService");
const respostaErro = require("../fixture/respostas/checkout/erroCartaoObrigatorio.json");
const checkoutValido = require("../fixture/requisicoes/checkout/validarCheckoutValido.json");
const respostaEsperada = require("../fixture/respostas/checkout/tokenInvalido.json");

describe("REST - Checkout Controller", () => {
  beforeEach(async () => {
    const respostaLogin = await request(app)
      .post("/api/users/login")
      .send(loginUser);

    token = respostaLogin.body.token;
  });

  it("Quando informo dados válidos, realiza o checkout com sucesso, com status 200", async () => {
    const resposta = await request(app)
      .post("/api/checkout")
      .set("authorization", `Bearer ${token}`)
      .send(checkoutValido);

    expect(resposta.status).to.equal(200);
  });

  it("Quando realizo checkout sem o Token, recebo mensagem de erro e status 401, via HTTP", async () => {
    const resposta = await request(app)
      .post("/api/checkout")
      .send(checkoutValido);

    expect(resposta.status).to.equal(401);
    expect(resposta.body).to.deep.equal(respostaEsperada);
  });

  it("Usando Mock: Validar Produto não encontrado, status 400", async () => {
    const checkoutServiceMock = sinon.stub(checkoutService, "checkout");
    checkoutServiceMock.throws(new Error(respostaErro.error));
    const resposta = await request(app)
      .post("/api/checkout")
      .set("authorization", `Bearer ${token}`)
      .send(checkoutValido);

    expect(resposta.status).to.equal(400);
    expect(resposta.body).to.deep.equal(respostaErro);
  });

  afterEach(() => {
    sinon.restore();
  });
});
