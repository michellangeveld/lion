# HTTP

[//]: # 'AUTO INSERT HEADER PREPUBLISH'

`http` is a small wrapper around `fetch`:

- Allows globally registering request and response transformers
- Throws on 4xx and 5xx status codes
- Supports a JSON request mode which automatically encodes/decodes body request and response payload as JSON
- Adds accept-language header to requests based on application language
- Adds XSRF header to request

## How to use

### Installation

```sh
npm i --save @lion/http
```

### Relation to fetch

`http` delegates all requests to fetch. `http.request` has the same function signature as `window.fetch`, you can use any online resource to learn more about fetch. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) is a great start.

### Example requests

#### GET request

```js
import { http } from '@lion/http';

const response = await http.request('/api/users');
const users = await response.json();
```

#### POST request

```js
import { http } from '@lion/http';

const response = await http.request('/api/users', {
  method: 'POST',
  body: JSON.stringify({ username: 'steve' }),
});
const newUser = await response.json();
```

### JSON requests

We usually deal with JSON requests and responses. You can use `httpJson` to avoid some of the boilerplate:

#### GET JSON request

```js
import { httpJson } from '@lion/http';

const users = await httpJson.request('/api/users');
```

#### POST JSON request

```js
import { httpJson } from '@lion/http';

const newUser = await httpJson.request('/api/users', {
  method: 'POST',
  body: { username: 'steve' },
});
```

### Error handling

Different from fetch, `http` and `httpJson` throw when the server returns a 4xx or 5xx, returning the request and response:

```js
import { http } from '@lion/http';

try {
  const users = await http.request('/api/users');
} catch (error) {
  if (error.response) {
    if (error.response.status === 400) {
      // handle a specific status code, for example 400 bad request
    } else {
      console.error(error);
    }
  } else {
    // an error happened before receiving a response, ex. an incorrect request or network error
    console.error(error);
  }
}
```
