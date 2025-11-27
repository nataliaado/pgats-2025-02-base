import http from "k6/http";
import { check, sleep, group } from "k6";

export const options = {
  vus: 10,
  //iterations: 1,
 duration: "20s",
 thresholds: {
    http_req_duration: ["p(90) <= 15", "p(95) <= 20"],
    http_req_failed: ["rate < 0.01"],
  },
};

export default function () {

  group("Registrar Usuário", () => {
  let responseUserRegister = http.post(
      "http://localhost:3000/api-docs/api/users/register",
      JSON.stringify({
        name: "Natalia",
        email: "nat@email.com",
        password: "123456"
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  });

  let responseUserLogin;
  group("Login do Usuário", () => {
    responseUserLogin = http.post(
      "http://localhost:3000/api-docs/api/users/login",
      JSON.stringify({
        email: "nat@email.com",
        password: "123456",
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  });

  group("Realizar Checkout", () => {
    let responseCheckout = http.post(
      "http://localhost:3000/api-docs/api/checkout",
      JSON.stringify({
        items: [
          {
            productId: 1,
            quantity: 1
          }
        ],
        freight: 0,
        paymentMethod: "boleto",
        cardData: {
          number: "string",
          name: "string",
          expiry: "string",
          cvv: "string"
        }
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${responseUserLogin.json("token")}`,
        },
      }
    );

    check(responseCheckout, {
      "status deve ser igual a 200": (res) => res.status === 200,
    });
  });

  group("Simulando o pensamento do Usuário", () => {
    sleep(1); // User Think Time
  });
}
