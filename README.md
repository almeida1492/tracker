# Tracker

## Setup

- Install the dependencies:

```
npm i
```

- At the root, create a `.env` file with the following content:

```
DATABASE_URL="file:./data.db?connection_limit=1"
SESSION_SECRET="e1bca18b3055034d64efd1aec3833bef"
```

- Setup the database:

```
npm run setup
```

- Start dev server:

```
npm run dev
```

- To login, use the following credentials:

```
Email address: henrique.ribeiro@intesys.it
Password: intesys
```
