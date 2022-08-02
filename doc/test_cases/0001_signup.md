# /signup Test cases

## POST /signup

+ Our endpoint works without any incoming data. POST to `signup` must return an error.
+ We will check that `email` field. If it's empty - endpoint must return error.
+ We will check that `email` field is checked correctly for an email. We will just try to put number, true/false, some string that is not email.
+ We will check that validator check that `password` is empty.
+ We will check that validator check that `passwordCheck` is empty.
+ We will check that validator correctly checks `password` and `passwordCheck` are equal.
+ We will check that `email` is unique

## GET /signup

+ Should get 404

## DELETE /signup

+ Should get 404

## PATCH /signup

+ Should get 404

## PUT /signup

+ Should get 404
