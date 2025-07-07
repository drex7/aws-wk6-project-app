# Fullstack Blog App with NuxtJs (REST API)

This app implement a **fullstack app with [Nuxt](https://nuxtjs.org//)** using [Vue](https://vuejs.org/) (frontend) and **Prisma Client** with AWS RDS Pstgres DB.

## Getting started

### 1. Download example and navigate into the project directory

Clone this repository:

```
git clone repo-url
```

Install npm dependencies:

```
yarn install
```

### 3. Build for production

```
npm run build
```

Build the docker image (local dev)

```
docker build -t gallery-app --build-arg DOCKER_ENV=dev --secret id=aws,src=./.env  .
```

Run the docker image (local dev)

```
docker run  --name gallery-app -e NODE_ENV=dev  -p 3000:3000 --rm -it test-node ash
```

The app is now running, navigate to [`http://localhost:3000/`](http://localhost:3000/) in your browser to explore its UI.

### Validate docker compose file
```
docker compose config --quiet && printf "OK\n" || printf "ERROR\n"
```
