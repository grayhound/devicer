# /devices Test cases

## POST /devices

+ it must return 401 without token
+ it should authenticate
+ it should return error without any data
+ it should create device with `name` parameter inputted

## GET /devices

- it should return 401 without token

- it should create user 1
- it should create user 2
- it should create user 3

- it should authenticate user 1
- it should authenticate user 2
- it should authenticate user 3

- user 1 should create pack of 80-120 devices
- user 2 should create pack of 80-120 devices
- user 3 should create pack of 80-120 devices

- user 1 should get list of devices for all available nexts
- user 2 should get list of devices for all available nexts
- user 2 should get list of devices for all available nexts

- user 1 should not have any devices that user 2 has
- user 1 should not have any devices that user 3 has

- user 2 should not have any devices that user 1 has
- user 2 should not have any devices that user 3 has

- user 2 should not have any devices that user 1 has
- user 2 should not have any devices that user 3 has

- user 1 should get an error if `next` parameter is not UUID.

- user 1 should try last page that doesn't exist

## DELETE /devices

- it must return 401 without token
- it should authenticate

## GET /devices/:id

- it must return 401 without token
- it should authenticate
- it should return error if :id is not correct UUID
- it should return

## PATCH /devices

-

## PUT /devices

- Should get 404
