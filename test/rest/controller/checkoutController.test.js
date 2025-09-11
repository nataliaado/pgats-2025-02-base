const request = require("supertest");
const sinon = require("sinon");
const { expect } = require("chai");

const app = require("../../../rest/app");

const checkoutService = require("../../../src/services/checkoutService");

describe("Checkout Controller", () => {
  describe("POST/ checkout", () => {
    beforeEach(async () => {
      const respostaLogin = await request(app).post("/api/users/login").send({
        email: "alice@email.com",
        password: "123456",
      });

      token = respostaLogin.body.token;
    });

    const checkoutValido = require("../fixture/requisicoes/validarCheckoutValido.json");

    it("Quando informo dados válidos, realiza o checkout com sucesso, com status 200", async () => {
      const resposta = await request(app)
        .post("/api/checkout")
        .set("authorization", `Bearer ${token}`)
        .send(checkoutValido);

      expect(resposta.status).to.equal(200);
    });

    it("Usando Mock: Validar Produto não encontrado, status 400", async () => {
      const checkoutServiceMock = sinon.stub(checkoutService, "checkout");
      checkoutServiceMock.throws(
        new Error("Dados do cartão obrigatórios para pagamento com cartão")
      );
      const resposta = await request(app)
        .post("/api/checkout")
        .set("authorization", `Bearer ${token}`)
        .send(checkoutValido);

      expect(resposta.status).to.equal(400);
      expect(resposta.body).to.have.property(
        "error",
        "Dados do cartão obrigatórios para pagamento com cartão"
      );
    });

    afterEach(() => {
      sinon.restore();
    });
  });
});
