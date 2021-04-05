# SW / PULLER / 7M

## Setup

```
  run below commands after clone
npm i
npm i nodemon --save-dev
npm i --save-dev @babel/core @babel/node @babel/cli

```

## Host File

```

```

## Command

```
npm start, to run the program
```


## Extra Instructions

```


change headless to 0 if you wanna see in the browser

currently data is fetched every 3 hours, you can change this by change the value of every_xms in the setup.js file

Create db and change the name of db in .env
create user for mysql db and change username and password in .env
create two tables in db 't01_bursa_articles' and t10_error

tables structure can be found under /shared/models/mysql/articles-bursa
bursa-article table must have two indexes, article_id and ur, both are unique and BTREE method
error table dont have index


```