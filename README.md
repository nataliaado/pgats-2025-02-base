# API Checkout Rest, GraphQL e K6

## Conceitos K6 aplicados no projeto
### Thresholds
Explicação:
  Utilizo de métrica de desempenho 'Thresholds' para verificar os parâmetros de tempo de resposta da API sendo testada.

Demonstração de uso: login.test.js 
  ```
export let options = {
 ...
  thresholds: {
    http_req_duration: ["p(95)<2000"],
  },
};
```

Demonstração de uso: checkout.test.js
 ```
export let options = {
  thresholds: {
    http_req_duration: ["p(95)<2000"],
  },
  stages: [
   ...
  ],
};
```

### Checks
Explicação:
  Utilizo de 'checks' para verificar/ fazer a comparação da resposta recebida da API com a resposta esperada. A verificação é feita com 'checks'.

Demonstração de uso: login.test.js 
```
check(responseUserRegister, {
      "Registro foi bem sucedido (status 201)": (res) => res.status === 201,
    });
```
```
check(responseUserLogin, {
      "Login foi bem sucedido (status 200)": (res) => res.status === 200,
    });
```
```
check(token, {
    "token obtido": (t) => !!t,
  });
```

Demonstração de uso: checkout.test.js
```
  check(responseCheckout, {
      "Checkout foi bem sucedido (status 200)": (res) => res.status === 200,
    });
```

### Helpers
Explicação:
  Faço o uso de 3 classes (getBaseURL.js, logintest.js e randomEmail.js), localizadas dentro da pasta k6/helpers. Tem o propósito de adicionar funcionalidades extras a classes que importem suas funcionalidades.

Funcionalidades:
  Geração de e-mail randômico, reutilização da URL de execução da API, Registro e Obtenção de Token de usuários.

Demonstração de uso: randomEmail.js
```
export function randomEmail() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    return `user_${timestamp}_${random}@test.com`;
}
```

### Trends
Explicação:
  Utilizo 'Trends' para análise de tendências e acompanhamento do histórico de execução da API sendo testada, em vez de focar apenas em uma execução isolada.

Demonstração de uso: checkout.test.js

Importação:
```
  import { Trend } from "k6/metrics";
```

Declaração:
```
  const checkoutTrend = new Trend("checkout_duration");
```

Utilização no Còdigo:
```
  const start = Date.now();
  const responseCheckout = http.post(url, payload, params);
  const duration = Date.now() - start;
  checkoutTrend.add(duration);
```

### Faker
Explicação:
  Utilizo da biblioteca 'faker' para gerar dados fictícios de usuário.

Demonstração de uso: login.test.js

Importação:
```
  import faker from "k6/x/faker"
```

Utilização no Còdigo:
```
   JSON.stringify({
        name: faker.person.firstName(),
        ...
      })
```

### Variável de ambiente
Explicação:
  Utilizo da função getBaseUrl() retornando uma variável de ambiente de onde a API está sendo executada.
  Uso desse valor dinamicamente nos testes em que preciso montar a requisição.

Demonstração de uso: getBaseUrl.js

Utilização no Còdigo:
```
export function getBaseUrl() {
    return __ENV.BASE_URL || 'http://localhost:3000';
}
```

Demonstração de uso: login.test.js
```
const responseUserRegister = http.post(
      `${getBaseUrl()}/api/users/register`,
      ...)
```

Demonstração de uso: checkout.test.js

Utilização no Còdigo:
```
  const url = `${getBaseUrl()}/api/checkout`;
```

### Stages
Explicação:
  Utilizo de 'Stages' para configurar a carga de usuários de maneira progressiva durante a execução do teste.

Demonstração de uso: checkout.test.js

Utilização no Còdigo:
```
  export let options = {
  ...
  },
  stages: [
    { duration: "3s", target: 10 },
    { duration: "15s", target: 10 },
    { duration: "2s", target: 100 },
    { duration: "3s", target: 100 },
    { duration: "5s", target: 10 },
    { duration: "5s", target: 0 },
  ]
```

### Reaproveitamento de Resposta
Explicação:
 Reaproveito a resposta quando capturo o token de uma resposta HTTP. Também reaproveito dados do registro do usuário para o login.

Demonstração de uso: login.test.js

```
token = responseUserLogin.json("token"); 

return token;
```

```
export const register = registerUser;
export const login = loginUser;

export default function () {
  const creds = register(); 
  const token = login(creds.email, creds.password); 
  ...
}
```

### Uso de Token de Autenticação
Explicação:
  Utilizo da classe (login.test.js), para capturar o token.
  Reaproveito essa funcionalidade numa chamada dentro da classe checkout.test.js, quando preciso do token no payload do checkout, para autorizar o checkout do usuário.

Demonstração de uso: checkout.test.js

Importação:
```
import { register, login } from "./helpers/login.test.js";
```

Utilização no Còdigo:
```
 group("Login User", function () {
      token = login(email, password);
    });

 const payload = JSON.stringify({
      items: [
       ...]
      },
    );
    const params = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }}   
```
### Data-Driven Testing
Explicação:
  Faço a utilização de um json (login.test.data.json) com dados de alguns usuários.
  Com a importação desse json para dentro da classe login.test.js, é possível reaproveitar esses dados para realizar o registro do usuário, por exemplo.

Demonstração de uso: login.test.js

Importação:
```
const users = new SharedArray("users", function () {
  return JSON.parse(open("../data/login.test.data.json"));
});
```
Declaração:
```
const user = users[(__VU - 1) % users.length];
```

Utilização no Còdigo:
```
const responseUserRegister = http.post(
      `${getBaseUrl()}/api/users/register`,
      JSON.stringify({
       ...
        password: user.password,
      }))
```

### Groups
Explicação:
  'Groups' é utilizado nas classes de teste K6 para organizar o código.

Demonstração de uso: login.test.js

Importação:
```
import { check, sleep, group } from "k6";
```

Utilização no Còdigo:
```
group("Registrar Usuário", () => {
    const responseUserRegister = http.post(
    ...
    )
  });
```
Demonstração de uso: checkout.test.js

Importação:
```
import { check, sleep, group } from "k6";
```

Utilização no Còdigo:
```
  group("Login User", function () {
      token = login(email, password);
    });
```


## Instalação

```bash
npm install express jsonwebtoken swagger-ui-express apollo-server-express graphql
```

## Configuração
Antes de seguir, crie um arquivo .env na pasta raiz contendo as propriedades BASE_URL_REST e BASE_URL_GRAPHQL com a URL desses serviços.

## Exemplos de chamadas

### REST

#### Registro de usuário
```bash
curl -X POST http://localhost:3000/api/users/register \
	-H "Content-Type: application/json" \
	-d '{"name":"Novo Usuário","email":"novo@email.com","password":"senha123"}'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/users/login \
	-H "Content-Type: application/json" \
	-d '{"email":"novo@email.com","password":"senha123"}'
```

#### Checkout (boleto)
```bash
curl -X POST http://localhost:3000/api/checkout \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <TOKEN_JWT>" \
	-d '{
		"items": [{"productId":1,"quantity":2}],
		"freight": 20,
		"paymentMethod": "boleto"
	}'
```

#### Checkout (cartão de crédito)
```bash
curl -X POST http://localhost:3000/api/checkout \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <TOKEN_JWT>" \
	-d '{
		"items": [{"productId":2,"quantity":1}],
		"freight": 15,
		"paymentMethod": "credit_card",
		"cardData": {
			"number": "4111111111111111",
			"name": "Nome do Titular",
			"expiry": "12/30",
			"cvv": "123"
		}
	}'
```

### GraphQL

#### Registro de usuário
Mutation:
```graphql
mutation Register($name: String!, $email: String!, $password: String!) {
  register(name: $name, email: $email, password: $password) {
    email
    name
  }
}

Variables:
{
  "name": "Julio",
  "email": "julio@abc.com",
  "password": "123456"
}
```

#### Login
Mutation:
```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
  }
}

Variables:
{
  "email": "alice@email.com",
  "password": "123456"
}
```


#### Checkout (boleto)
Mutation (envie o token JWT no header Authorization: Bearer <TOKEN_JWT>):
```graphql
mutation Checkout($items: [CheckoutItemInput!]!, $freight: Float!, $paymentMethod: String!, $cardData: CardDataInput) {
  checkout(items: $items, freight: $freight, paymentMethod: $paymentMethod, cardData: $cardData) {
    freight
    items {
      productId
      quantity
    }
    paymentMethod
    userId
    valorFinal
  }
}

Variables:
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ],
  "freight": 10,
  "paymentMethod": "boleto"
}
```

#### Checkout (cartão de crédito)
Mutation (envie o token JWT no header Authorization: Bearer <TOKEN_JWT>):
```graphql
mutation {
	checkout(
		items: [{productId: 2, quantity: 1}],
		freight: 15,
		paymentMethod: "credit_card",
		cardData: {
			number: "4111111111111111",
			name: "Nome do Titular",
			expiry: "12/30",
			cvv: "123"
		}
	) {
		valorFinal
		paymentMethod
		freight
		items { productId quantity }
	}
}

Variables:
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ],
  "freight": 10,
  "paymentMethod": "credit_card",
  "cardData": {
    "cvv": "123",
    "expiry": "10/04",
    "name": "Julio Costa",
    "number": "1234432112344321"
  }
}
```

#### Consulta de usuários
Query:
```graphql
query Users {
  users {
    email
    name
  }
}
```

## Como rodar

### REST
```bash
node rest/server.js
```
Acesse a documentação Swagger em [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### GraphQL
```bash
node graphql/app.js
```
Acesse o playground GraphQL em [http://localhost:4000/graphql](http://localhost:4000/graphql)

## Endpoints REST
- POST `/api/users/register` — Registro de usuário
- POST `/api/users/login` — Login (retorna token JWT)
- POST `/api/checkout` — Checkout (requer token JWT)

## Regras de Checkout
- Só pode fazer checkout com token JWT válido
- Informe lista de produtos, quantidades, valor do frete, método de pagamento e dados do cartão se necessário
- 5% de desconto no valor total se pagar com cartão
- Resposta do checkout contém valor final

## Banco de dados
- Usuários e produtos em memória (veja arquivos em `src/models`)

## Testes
- Para testes automatizados, importe o `app` de `rest/app.js` ou `graphql/app.js` sem o método `listen()`

## Documentação
- Swagger disponível em `/api-docs`
- Playground GraphQL disponível em `/graphql`
