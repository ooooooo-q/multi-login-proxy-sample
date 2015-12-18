複数ログインを実現するproxyのサンプル実装
========


### 設定

```
{
    port: 3000, // 起動ポート
    dest: "http://example.com/" // proxy先
}
```

### セッション作成

```js
var login_a = null;
var login_b = null;

// login by user_a
fetch("/login",{
    method: "post",
    credentials: "same-origin",
    body: JSON.stringify({mail: ..., password: ...})
})
.then( (response) =>{
    login_a = reseponse.headers["X-Multi-Login-UUID"];
});

fetch("/login",{
    method: "post",
    credentials: "same-origin",
    body: JSON.stringify({mail: ..., password: ...})
})
.then( (response) =>{
    login_b = reseponse.headers["X-Multi-Login-UUID"];
});
```

### セッション利用

```
fetch("/items", {heaaders:{"x-login-uuid": login_a}})
.then( (response) => {
    console.log(response.body);
});

fetch("/items", {heaaders:{"x-login-uuid": login_b}})
.then( (response) => {
    console.log(response.body);
});
```






