## 结果Status状态码说明


| status   | 说明      |
| -------- | -------- |
| 0        | 响应成功   |
| 1        | 响应失败   |
| 401      | 未认证登录  |
| 404      | NOT Found |
| 422      |  参数错误  |
| 498      |  无效token |
| 499      |  请求header需要设置token|
| 500      |  服务器错误  |


## headers 设置

* `Content-Type: application/json` json格式请求
* `Authorization: Bearer token` 需要token认证的API，headers中需带上token字符串
