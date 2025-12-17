import http from "k6/http";
import { check, sleep, group } from "k6";
import { Trend } from "k6/metrics";
import { getBaseUrl } from "./helpers/getBaseUrl.js";
import { register, login } from "./helpers/login.test.js";

export let options = {
  thresholds: {
    http_req_duration: ["p(95)<2000"],
  },
  stages: [
    { duration: "3s", target: 10 },
    { duration: "15s", target: 10 },
    { duration: "2s", target: 100 },
    { duration: "3s", target: 100 },
    { duration: "5s", target: 10 },
    { duration: "5s", target: 0 },
  ],
};

const checkoutTrend = new Trend("checkout_duration");

export default function () {
  group("Realizar Checkout", () => {
    const creds = register();
    const email = creds.email;
    const password = creds.password;
    let token = null;

    group("Login User", function () {
      token = login(email, password);
    });

    const url = `${getBaseUrl()}/api/checkout`;
    const payload = JSON.stringify({
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
    });
    const params = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const start = Date.now();
    const responseCheckout = http.post(url, payload, params);
    const duration = Date.now() - start;
    checkoutTrend.add(duration);
    check(responseCheckout, {
      "Checkout foi bem sucedido (status 200)": (res) => res.status === 200,
    });
  });

  group("Simulando o pensamento do Usuário", () => {
    sleep(1);
  });
}
