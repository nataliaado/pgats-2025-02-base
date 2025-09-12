const request = require("supertest");
const sinon = require("sinon");
const { expect } = require("chai");

const app = require("../../../graphql/app");

const loginUser = require("../fixture/requisicoes/login/loginUser.json");
const checkoutValido = require("../fixture/requisicoes/checkout/validarCheckoutValido.json");
const respostaPaymentValido = require("../fixture/respostas/checkout/verificarPaymentMethod.json");

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

  afterEach(() => {
    sinon.restore();
  });
});
