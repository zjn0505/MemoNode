# MemoNode
The node server for Pullsh.

Web app, served on https://pullsh.me.

Android app, download from [Google Play](https://play.google.com/store/apps/details?id=xyz.jienan.pushpull).

Chrome extension, available on [Chrome Webstore](https://chrome.google.com/webstore/detail/pullsh/efinljejnfeaongopbnijppjolghpook).

## Api list

- [Create a memo](#create_a_memo)
- [Read a memo](#read_a_memo)

---
### Create a memo

* **URL**

  /memo
  
* **Method**
 
  `POST`

* **URL Params**

| Name              | Required | Type   | Description |
| ---               | :---:    | ---    | ---         |
|  msg              |  *       |String  | memo content|
|  expired_on       |          |String  | memo expired after 'N' (min/hr/day)|
|  max_access_count |          |Integer | memo inaccessible after 'N' reads|
|  client           |          |String  | return memo id in html, if client='web'|

* **Data Params**

  None

* **Success Response**

  * **Code:** 200 <br />
    **Content:** 
```json
{
    "result": 200,
    "msg": "Succeed",
    "memo": {
        "_id": "paj0",
        "msg": "test",
        "access_count": 0,
        "created_date": "2018-05-28T03:46:05.134Z",
        "expired_on": "2018-05-29T03:46:05.132Z",
        "max_access_count": 100
    }
}
```
----

### Read a memo

* **URL**

  /memo
  
* **Method**
 
  `GET`

* **URL Params**

| Name | Required | Type  | Description |
| ---  | :---:    | ---   | ---         |
| memoId|  *       |String| memo id |

* **Success Response**

```json
{
    "result": 200,
    "msg": "Succeed",
    "memo": {
        "_id": "help",
        "msg": "Click to read. Swipe to dismiss.\n\nPullsh is a tool to help you to check and share text with short id between devices.\nIt is available on Android, https://pullsh.me, and Chrome Extension.\n\nTo create a memo (Push), swipe the pink action button to the left.\nInput your memo, and click '+'. You will get a unique id for you memo.\nYou can also share text to Pullsh in Android to quickly create a push.\n\nTo read a memo (Pull), you can swipe the action button to the right.\nInpur the memo id, and click '+'. The memo will be added to the list.\n\nYou can alse create a push or pull on https://pullsh.me and using Pullsh Chrome Extension.\nThis help doc has the id 'help'. You can read it or share it with the id or, using the full path https://pullsh.me/help.\nIf the memo your want to share is a link, add '-' after the address for quickly access. e.g. https://pullsh.me/LiNk- will bring you the memo link address.\n\nTo keep your memo secure, you can use push config to add access control to your memo.\nAfter the memo expired, or reaching maximum access counts, no one can read it anymore.",
        "access_count": 142,
        "created_date": "2017-12-21T17:13:03.768Z",
        "expired_on": null,
        "max_access_count": null
    }
}
```
----

### Read a memo from web

* **URL**

  /memo/[memoId]
  
* **Method**
 
  `GET`

* **URL Params**

| Name | Required | Type  | Description |
| ---  | :---:    | ---   | ---         |
| memoId|  *    |String   | memo id, add '-' at the end for redirect if the memo content is an url    |

* **Data Params**

  None
