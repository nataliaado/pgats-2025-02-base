import http from "k6/http";
import { check, sleep, group } from "k6";
import { getBaseUrl } from "./helpers/getBaseUrl.js";
import { register, login } from "./helpers/login.test.js";

export const options = {
  vus: 1,
  iterations: 1,
  /* duration: "20s",
  thresholds: {
    http_req_duration: ["p(90) <= 15", "p(95) <= 20"],
  },*/
};

export default function () {
group("Realizar Checkout", () => {
  const creds = register();
  const email = creds.email;
  const password = creds.password;
  let token = null;

  group("Login User", function () {
    token = login(email, password);
  });

  let responseCheckout = http.post(
    `${getBaseUrl()}/api/checkout`,
    JSON.stringify({
      items: [
        {
          productId: 1,
          quantity: 1,
        },
      ],
      freight: 0,
      paymentMethod: "boleto",
      cardData: {
        number: "string",
        name: "string",
        expiry: "string",
        cvv: "string",
      },
    }),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  check(responseCheckout, {
    "Checkout foi bem sucedido (status 200)": (res) => res.status === 200,
  });
});

group("Simulando o pensamento do Usuário", () => {
  sleep(1);
});
}
