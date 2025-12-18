import http from "k6/http";
import { check, sleep, group } from "k6";
import { getBaseUrl } from "./getBaseUrl.js";
import { SharedArray } from "k6/data";
import { randomEmail } from "./randomEmail.js";
import faker from "k6/x/faker";

const users = new SharedArray("users", function () {
  return JSON.parse(open("../data/login.test.data.json"));
});

export let options = {
  vus: 100,
  iterations: 1000,
  thresholds: {
    http_req_duration: ["p(95)<2000"],
  },
};

export function registerUser() {
  const user = users[(__VU - 1) % users.length];
  const email = randomEmail();

  group("Registrar Usuário", () => {
    const responseUserRegister = http.post(
      `${getBaseUrl()}/api/users/register`,
      JSON.stringify({
        name: faker.person.firstName(),
        email: email,
        password: user.password,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    check(responseUserRegister, {
      "Registro foi bem sucedido (status 201)": (res) => res.status === 201,
    });
    sleep(1);
  });

  return { email: email, password: user.password };
}

export function loginUser(email, password) {
  let token = null;

  group("Login do Usuário", () => {
    const responseUserLogin = http.post(
      `${getBaseUrl()}/api/users/login`,
      JSON.stringify({
        email: email,
        password: password,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    check(responseUserLogin, {
      "Login foi bem sucedido (status 200)": (res) => res.status === 200,
    });

    try {
      token = responseUserLogin.json("token");
    } catch (e) {
      token = null;
    }

    sleep(1);
  });

  return token;
}

export const register = registerUser;
export const login = loginUser;

export default function () {
  const creds = register();
  const token = login(creds.email, creds.password);

  check(token, {
    "token obtido": (t) => !!t,
  });

  sleep(1);
}
