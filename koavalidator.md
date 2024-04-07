## koaValidator 库

> 主要用来做参数过滤校验，及验证不过时统一参数不合格提示信息 

> 移植https://github.com/luckcoding/koa-middle-validator， 针对koa2以及采用原生Promise, 调整了部分代码 

> koa-middle-validator 该库fork源express框架流行的express-validator，基于validator 

> validator: https://github.com/chriso/validator.js

> 链式验证支持validator所有支持的方法， 也支持自定义验证方法。

### 引用 及 挂载中间件

```javascript

const koaValidator = require('./lib/koaValidator');

```


```javascript
app.use(koaValidator());

or

// 例如：支持自定义一些验证func 及转移过滤方法
app.use(koaValidator({
   customValidators: {
    isArray: function(value) {
      return Array.isArray(value);
    },
    isAsyncTest: function(testparam) {
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          if (testparam === '42') { return resolve(); }
          reject();
        }, 200);
      });
    }
  },
  customSanitizers: {
    toTestSanitize: function() {
      return "!!!!";
    }
  }
}));
```

## controller中使用

常规用法，链式写法

- check  检查 query,body, params
- checkBody 检查 body参数
- checkQuery 检查 query参数
- checkParams 检查 params参数
- checkHeaders 检查 headers参数

```javascript
async function validateParams(ctx, logger) {


    ctx.checkBody('name').notEmpty().withMessage('无效的名称');
    ctx.checkBody('id').isInt({ gt: 0 }).withMessage('无效的Id');

    let errors = await ctx.getValidationResult();
    if (!errors.isEmpty()) {
        ctx.status = 422;
        ctx.body = respond(null, 422, errors.array());
        logger.warn('validate error', errors.array());
        return false;
    }
    return true;
}
```

### 得到验证结果

使用`getValidationResult`得到验证结果，返回`Promise`，可以用`then`，建议使用`await`接受结果

```
ctx.checkBody('email', 'required').notEmpty();
ctx.checkBody('email', 'valid email required').isEmail();
ctx.checkBody('password', '6 to 20 characters required').len(6, 20);

ctx.getValidationResult().then(function(result) {
  // do something with the validation result
});

or

let errors = await ctx.getValidationResult();

```

### 参数可选

```
ctx.checkBody('email').optional().isEmail();
//if there is no error, ctx.request.body.email is either undefined or a valid mail.

```

### 其他链式校验方法见底部表格说明

见 [Validators](#Validators)

### Sanitizer 转移过滤

#### ctx.sanitize();
```javascript
ctx.request.body.comment = 'a <span>comment</span>';
ctx.request.body.username = '   a user    ';

ctx.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
ctx.sanitize('username').trim(); // returns 'a user'

console.log(ctx.request.body.comment); // 'a &lt;span&gt;comment&lt;/span&gt;'
console.log(ctx.request.body.username); // 'a user'
```

#### ctx.filter();
同 [ctx.sanitize()](#reqsanitize).

#### ctx.sanitizeBody();
同 [ctx.sanitize()](#reqsanitize), 只检查 in `ctx.request.body`.

#### ctx.sanitizeQuery();
同 [ctx.sanitize()](#reqsanitize), 只检查 in `ctx.query`.

#### ctx.sanitizeParams();
同 [ctx.sanitize()](#reqsanitize), 只检查 in `ctx.params`.

#### ctx.sanitizeHeaders();
只检查 `ctx.headers`. 另外`ctx.sanitize()` 不会检查ctx.headers.


## <span id="Validators">Validators</span>

Here is a list of the validators currently available.

Validator                               | Description
--------------------------------------- | --------------------------------------
***contains(str, seed)***               | check if the string contains the seed.
**equals(str, comparison)**             | check if the string matches the comparison.
**isAfter(str [, date])**               | check if the string is a date that's after the specified date (defaults to now).
**isAlpha(str [, locale])**             | check if the string contains only letters (a-zA-Z).<br/><br/>Locale is one of `['ar', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG', 'ar-IQ', 'ar-JO', 'ar-KW', 'ar-LB', 'ar-LY', 'ar-MA', 'ar-QA', 'ar-QM', 'ar-SA', 'ar-SD', 'ar-SY', 'ar-TN', 'ar-YE', 'bg-BG', 'cs-CZ', 'da-DK', 'de-DE', 'el-GR', 'en-AU', 'en-GB', 'en-HK', 'en-IN', 'en-NZ', 'en-US', 'en-ZA', 'en-ZM', 'es-ES', 'fr-FR', 'hu-HU', 'it-IT', 'nb-NO', 'nl-NL', 'nn-NO', 'pl-PL', 'pt-BR', 'pt-PT', 'ru-RU', 'sk-SK', 'sr-RS', 'sr-RS@latin', 'sv-SE', 'tr-TR', 'uk-UA']`) and defaults to `en-US`.
**isAlphanumeric(str [, locale])**      | check if the string contains only letters and numbers.<br/><br/>Locale is one of `['ar', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG', 'ar-IQ', 'ar-JO', 'ar-KW', 'ar-LB', 'ar-LY', 'ar-MA', 'ar-QA', 'ar-QM', 'ar-SA', 'ar-SD', 'ar-SY', 'ar-TN', 'ar-YE', 'bg-BG', 'cs-CZ', 'da-DK', 'de-DE', 'el-GR', 'en-AU', 'en-GB', 'en-HK', 'en-IN', 'en-NZ', 'en-US', 'en-ZA', 'en-ZM', 'es-ES', 'fr-FR', 'hu-HU', 'it-IT', 'nb-NO', 'nl-NL', 'nn-NO', 'pl-PL', 'pt-BR', 'pt-PT', 'ru-RU', 'sk-SK', 'sr-RS', 'sr-RS@latin', 'sv-SE', 'tr-TR', 'uk-UA']`) and defaults to `en-US`.
**isAscii(str)**                        | check if the string contains ASCII chars only.
**isBase64(str)**                       | check if a string is base64 encoded.
**isBefore(str [, date])**              | check if the string is a date that's before the specified date.
**isBoolean(str)**                      | check if a string is a boolean.
**isByteLength(str [, options])**          | check if the string's length (in UTF-8 bytes) falls in a range.<br/><br/>`options` is an object which defaults to `{min:0, max: undefined}`.
**isCreditCard(str)**                   | check if the string is a credit card.
**isCurrency(str [, options])**            | check if the string is a valid currency amount.<br/><br/>`options` is an object which defaults to `{symbol: '$', require_symbol: false, allow_space_after_symbol: false, symbol_after_digits: false, allow_negatives: true, parens_for_negatives: false, negative_sign_before_digits: false, negative_sign_after_digits: false, allow_negative_sign_placeholder: false, thousands_separator: ',', decimal_separator: '.', allow_decimal: true, require_decimal: false, digits_after_decimal: [2], allow_space_after_digits: false}`.<br/>**Note:** The array `digits_after_decimal` is filled with the exact number of digits allowd not a range, for example a range 1 to 3 will be given as [1, 2, 3].
**isDataURI(str)**                      | check if the string is a [data uri format](https://developer.mozilla.org/en-US/docs/Web/HTTP/data_URIs).
**isDecimal(str [, options])**             | check if the string represents a decimal number, such as 0.1, .3, 1.1, 1.00003, 4.0, etc.<br/><br/>`options` is an object which defaults to `{force_decimal: false, decimal_digits: '1,', locale: 'en-US'}`<br/><br/>`locale` determine the decimal separator and is one of `['ar', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG', 'ar-IQ', 'ar-JO', 'ar-KW', 'ar-LB', 'ar-LY', 'ar-MA', 'ar-QA', 'ar-QM', 'ar-SA', 'ar-SD', 'ar-SY', 'ar-TN', 'ar-YE', 'bg-BG', 'cs-CZ', 'da-DK', 'de-DE', 'en-AU', 'en-GB', 'en-HK', 'en-IN', 'en-NZ', 'en-US', 'en-ZA', 'en-ZM', 'es-ES', 'fr-FR', 'hu-HU', 'it-IT', 'nb-NO', 'nl-NL', 'nn-NO', 'pl-PL', 'pt-BR', 'pt-PT', 'ru-RU', 'sr-RS', 'sr-RS@latin', 'sv-SE', 'tr-TR', 'uk-UA']`.<br/>**Note:** `decimal_digits` is given as a range like '1,3', a specific value like '3' or min like '1,'.
**isDivisibleBy(str, number)**          | check if the string is a number that's divisible by another.
**isEmail(str [, options])**            | check if the string is an email.<br/><br/>`options` is an object which defaults to `{ allow_display_name: false, require_display_name: false, allow_utf8_local_part: true, require_tld: true }`. If `allow_display_name` is set to true, the validator will also match `Display Name <email-address>`. If `require_display_name` is set to true, the validator will reject strings without the format `Display Name <email-address>`. If `allow_utf8_local_part` is set to false, the validator will not allow any non-English UTF8 character in email address' local part. If `require_tld` is set to false, e-mail addresses without having TLD in their domain will also be matched.
**isEmpty(str)**                        | check if the string has a length of zero.
**isFQDN(str [, options])**             | check if the string is a fully qualified domain name (e.g. domain.com).<br/><br/>`options` is an object which defaults to `{ require_tld: true, allow_underscores: false, allow_trailing_dot: false }`.
**isFloat(str [, options])**            | check if the string is a float.<br/><br/>`options` is an object which can contain the keys `min`, `max`, `gt`, and/or `lt` to validate the float is within boundaries (e.g. `{ min: 7.22, max: 9.55 }`) it also has `locale` as an option.<br/><br/>`min` and `max` are equivalent to 'greater or equal' and 'less or equal', respectively while `gt` and `lt` are their strict counterparts.<br/><br/>`locale` determine the decimal separator and is one of `['ar', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG', 'ar-IQ', 'ar-JO', 'ar-KW', 'ar-LB', 'ar-LY', 'ar-MA', 'ar-QA', 'ar-QM', 'ar-SA', 'ar-SD', 'ar-SY', 'ar-TN', 'ar-YE', 'bg-BG', 'cs-CZ', 'da-DK', 'de-DE', 'en-AU', 'en-GB', 'en-HK', 'en-IN', 'en-NZ', 'en-US', 'en-ZA', 'en-ZM', 'es-ES', 'fr-FR', 'hu-HU', 'it-IT', 'nb-NO', 'nl-NL', 'nn-NO', 'pl-PL', 'pt-BR', 'pt-PT', 'ru-RU', 'sr-RS', 'sr-RS@latin', 'sv-SE', 'tr-TR', 'uk-UA']`.
**isFullWidth(str)**                    | check if the string contains any full-width chars.
**isHalfWidth(str)**                    | check if the string contains any half-width chars.
**isHash(str, algorithm)**              | check if the string is a hash of type algorithm.<br/><br/>Algorithm is one of `['md4', 'md5', 'sha1', 'sha256', 'sha384', 'sha512', 'ripemd128', 'ripemd160', 'tiger128', 'tiger160', 'tiger192', 'crc32', 'crc32b']`
**isHexColor(str)**                     | check if the string is a hexadecimal color.
**isHexadecimal(str)**                  | check if the string is a hexadecimal number.
**isIP(str [, version])**               | check if the string is an IP (version 4 or 6).
**isISBN(str [, version])**             | check if the string is an ISBN (version 10 or 13).
**isISSN(str [, options])**             | check if the string is an [ISSN](https://en.wikipedia.org/wiki/International_Standard_Serial_Number).<br/><br/>`options` is an object which defaults to `{ case_sensitive: false, require_hyphen: false }`. If `case_sensitive` is true, ISSNs with a lowercase `'x'` as the check digit are rejected.
**isISIN(str)**                         | check if the string is an [ISIN][ISIN] (stock/security identifier).
**isISO8601(str)**                      | check if the string is a valid [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) date.
**isRFC3339(str)**                      | check if the string is a valid [RFC 3339](https://tools.ietf.org/html/rfc3339) date.
**isISO31661Alpha2(str)**               | check if the string is a valid [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) officially assigned country code.
**isISO31661Alpha3(str)**               | check if the string is a valid [ISO 3166-1 alpha-3](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3) officially assigned country code.
**isISRC(str)**                         | check if the string is a [ISRC](https://en.wikipedia.org/wiki/International_Standard_Recording_Code).
**isIn(str, values)**                   | check if the string is in a array of allowed values.
**isInt(str [, options])**              | check if the string is an integer.<br/><br/>`options` is an object which can contain the keys `min` and/or `max` to check the integer is within boundaries (e.g. `{ min: 10, max: 99 }`). `options` can also contain the key `allow_leading_zeroes`, which when set to false will disallow integer values with leading zeroes (e.g. `{ allow_leading_zeroes: false }`). Finally, `options` can contain the keys `gt` and/or `lt` which will enforce integers being greater than or less than, respectively, the value provided (e.g. `{gt: 1, lt: 4}` for a number between 1 and 4).
**isJSON(str)**                         | check if the string is valid JSON (note: uses JSON.parse).
**isLatLong(str)**                      | check if the string is a valid latitude-longitude coordinate in the format `lat,long` or `lat, long`.
**isLength(str [, options])**              | check if the string's length falls in a range.<br/><br/>`options` is an object which defaults to `{min:0, max: undefined}`. Note: this function takes into account surrogate pairs.
**isLowercase(str)**                    | check if the string is lowercase.
**isMACAddress(str)**                   | check if the string is a MAC address.
**isMD5(str)**                          | check if the string is a MD5 hash.
**isMimeType(str)**                     | check if the string matches to a valid [MIME type](https://en.wikipedia.org/wiki/Media_type) format
**isMobilePhone(str, locale [, options])**          | check if the string is a mobile phone number,<br/><br/>(locale is one of `['ar-AE', 'ar-DZ', 'ar-EG', 'ar-JO', 'ar-SA', 'ar-SY', 'be-BY', 'bg-BG', 'cs-CZ', 'de-DE', 'da-DK', 'el-GR', 'en-AU', 'en-CA', 'en-GB', 'en-HK', 'en-IN',  'en-KE', 'en-NG', 'en-NZ', 'en-RW', 'en-SG', 'en-UG', 'en-US', 'en-TZ', 'en-ZA', 'en-ZM', 'en-PK', 'es-ES', 'et-EE', 'fa-IR', 'fi-FI', 'fr-FR', 'he-IL', 'hu-HU', 'it-IT', 'ja-JP', 'kk-KZ', 'ko-KR', 'lt-LT', 'ms-MY', 'nb-NO', 'nn-NO', 'pl-PL', 'pt-PT', 'pt-BR', 'ro-RO', 'ru-RU', 'sk-SK', 'sr-RS', 'th-TH', 'tr-TR', 'uk-UA', 'vi-VN', 'zh-CN', 'zh-HK', 'zh-TW']` OR 'any'. If 'any' is used, function will check if any of the locales match).<br/><br/>`options` is an optional object that can be supplied with the following keys: `strictMode`, if this is set to `true`, the mobile phone number must be supplied with the country code and therefore must start with `+`.
**isMongoId(str)**                      | check if the string is a valid hex-encoded representation of a [MongoDB ObjectId][mongoid].
**isMultibyte(str)**                    | check if the string contains one or more multibyte chars.
**isNumeric(str)**                      | check if the string contains only numbers.
**isPort(str)**                         | check if the string is a valid port number.
**isPostalCode(str, locale)**           | check if the string is a postal code,<br/><br/>(locale is one of `[ 'AT', 'AU', 'BE', 'BG', 'CA', 'CH', 'CZ', 'DE', 'DK', 'DZ', 'ES', 'FI', 'FR', 'GB', 'GR', 'IL', 'IN', 'IS', 'IT', 'JP', 'KE', 'LI', 'MX', 'NL', 'NO', 'PL', 'PT', 'RO', 'RU', 'SA', 'SE', 'TW', 'US', 'ZA', 'ZM' ]` OR 'any'. If 'any' is used, function will check if any of the locals match).
**isSurrogatePair(str)**                | check if the string contains any surrogate pairs chars.
**isURL(str [, options])**              | check if the string is an URL.<br/><br/>`options` is an object which defaults to `{ protocols: ['http','https','ftp'], require_tld: true, require_protocol: false, require_host: true, require_valid_protocol: true, allow_underscores: false, host_whitelist: false, host_blacklist: false, allow_trailing_dot: false, allow_protocol_relative_urls: false }`.
**isUUID(str [, version])**             | check if the string is a UUID (version 3, 4 or 5).
**isUppercase(str)**                    | check if the string is uppercase.
**isVariableWidth(str)**                | check if the string contains a mixture of full and half-width chars.
**isWhitelisted(str, chars)**           | checks characters if they appear in the whitelist.
**matches(str, pattern [, modifiers])** | check if string matches the pattern.<br/><br/>Either `matches('foo', /foo/i)` or `matches('foo', 'foo', 'i')`.

## Sanitizers

Here is a list of the sanitizers currently available.

Sanitizer                              | Description
-------------------------------------- | -------------------------------
**blacklist(input, chars)**            | remove characters that appear in the blacklist. The characters are used in a RegExp and so you will need to escape some chars, e.g. `blacklist(input, '\\[\\]')`.
**escape(input)**                      | replace `<`, `>`, `&`, `'`, `"` and `/` with HTML entities.
**unescape(input)**                    | replaces HTML encoded entities with `<`, `>`, `&`, `'`, `"` and `/`.
**ltrim(input [, chars])**             | trim characters from the left-side of the input.
**normalizeEmail(email [, options])**  | canonicalizes an email address. (This doesn't validate that the input is an email, if you want to validate the email use isEmail beforehand)<br/><br/>`options` is an object with the following keys and default values:<br/><ul><li>*all_lowercase: true* - Transforms the local part (before the @ symbol) of all email addresses to lowercase. Please note that this may violate RFC 5321, which gives providers the possibility to treat the local part of email addresses in a case sensitive way (although in practice most - yet not all - providers don't). The domain part of the email address is always lowercased, as it's case insensitive per RFC 1035.</li><li>*gmail_lowercase: true* - GMail addresses are known to be case-insensitive, so this switch allows lowercasing them even when *all_lowercase* is set to false. Please note that when *all_lowercase* is true, GMail addresses are lowercased regardless of the value of this setting.</li><li>*gmail_remove_dots: true*: Removes dots from the local part of the email address, as GMail ignores them (e.g. "john.doe" and "johndoe" are considered equal).</li><li>*gmail_remove_subaddress: true*: Normalizes addresses by removing "sub-addresses", which is the part following a "+" sign (e.g. "foo+bar@gmail.com" becomes "foo@gmail.com").</li><li>*gmail_convert_googlemaildotcom: true*: Converts addresses with domain @googlemail.com to @gmail.com, as they're equivalent.</li><li>*outlookdotcom_lowercase: true* - Outlook.com addresses (including Windows Live and Hotmail) are known to be case-insensitive, so this switch allows lowercasing them even when *all_lowercase* is set to false. Please note that when *all_lowercase* is true, Outlook.com addresses are lowercased regardless of the value of this setting.</li><li>*outlookdotcom_remove_subaddress: true*: Normalizes addresses by removing "sub-addresses", which is the part following a "+" sign (e.g. "foo+bar@outlook.com" becomes "foo@outlook.com").</li><li>*yahoo_lowercase: true* - Yahoo Mail addresses are known to be case-insensitive, so this switch allows lowercasing them even when *all_lowercase* is set to false. Please note that when *all_lowercase* is true, Yahoo Mail addresses are lowercased regardless of the value of this setting.</li><li>*yahoo_remove_subaddress: true*: Normalizes addresses by removing "sub-addresses", which is the part following a "-" sign (e.g. "foo-bar@yahoo.com" becomes "foo@yahoo.com").</li><li>*icloud_lowercase: true* - iCloud addresses (including MobileMe) are known to be case-insensitive, so this switch allows lowercasing them even when *all_lowercase* is set to false. Please note that when *all_lowercase* is true, iCloud addresses are lowercased regardless of the value of this setting.</li><li>*icloud_remove_subaddress: true*: Normalizes addresses by removing "sub-addresses", which is the part following a "+" sign (e.g. "foo+bar@icloud.com" becomes "foo@icloud.com").</li></ul>
**rtrim(input [, chars])**             | trim characters from the right-side of the input.
**stripLow(input [, keep_new_lines])** | remove characters with a numerical value < 32 and 127, mostly control characters. If `keep_new_lines` is `true`, newline characters are preserved (`\n` and `\r`, hex `0xA` and `0xD`). Unicode-safe in JavaScript.
**toBoolean(input [, strict])**        | convert the input string to a boolean. Everything except for `'0'`, `'false'` and `''` returns `true`. In strict mode only `'1'` and `'true'` return `true`.
**toDate(input)**                      | convert the input string to a date, or `null` if the input is not a date.
**toFloat(input)**                     | convert the input string to a float, or `NaN` if the input is not a float.
**toInt(input [, radix])**             | convert the input string to an integer, or `NaN` if the input is not an integer.
**trim(input [, chars])**              | trim characters (whitespace by default) from both sides of the input.
**whitelist(input, chars)**            | remove characters that do not appear in the whitelist. The characters are used in a RegExp and so you will need to escape some chars, e.g. `whitelist(input, '\\[\\]')`.