# website-demo

## Prerequisites
Docker:  https://docs.docker.com/docker-for-mac/install/

## Use

1. Clone repo
2. Run the command `docker-compose up`
3. Navigate to http://localhost:5000
4. ???
5. Profit

You can edit application code in app.py to change how each route works the default route will show you how many times you have viewed the site.

Once completed `ctrl+c` to kill the running container.

`docker-compose down` 

### Additional routes

http://localhost:5000/color/   - You can edit the background color (I use `red` and `blue`) server will reload on save.

http://localhost:5000/cookie/  - Will set a basic cookie

http://localhost:5000/third/   - Will set thirdparty facebook cookie.



