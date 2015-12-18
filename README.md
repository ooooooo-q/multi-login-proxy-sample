マルチログインを実現するproxyのサンプル実装
========

### 目的

- マルチログインに対応していないサーバに対して、マルチログインを実現する
- クライアント側でどのユーザのリクエストとして送信するかを制御できる
- 本物のセッションIDはクライアントのjsから触れないようにする

### 方法

- proxyサーバを立て、クライアント<=>proxサーバ間でクッキーを使わないセッションを作る

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
    headers:{
        "Accept": "application/json",
        "Content-Type": "application/json",
        "x-login-create": true
    },
    body: JSON.stringify({"mail": "user_a@example.com", password: "..."})
})
.then( (response) =>{
    login_a = response.headers.get("X-Multi-Login-UUID");
});

// login by user_b
fetch("/login",{
    method: "post",
    headers:{
        "Accept": "application/json",
        "Content-Type": "application/json",
        "x-login-create": true
    },
    body: JSON.stringify({"mail": "user_b@example.com", password: "..."})
})
.then( (response) =>{
    login_b = response.headers.get("X-Multi-Login-UUID");;
});
```

### セッション利用

```js
// get user_a
fetch("/items", {
    headers:{
        "Accept": "application/json",
        "Content-Type": "application/json",    
        "x-login-uuid": login_a
    }
}).then( (response) => {
    return response.json();
}).then( (json) => {
    console.log("user a :" + JSON.stringify(json));
});


// get user_b
fetch("/items", {
    headers:{
        "Accept": "application/json",
        "Content-Type": "application/json",    
        "x-login-uuid": login_b
    }
}).then( (response) => {
    return response.json();
}).then( (json) => {
    console.log("user b :" + JSON.stringify(json));
});
```






