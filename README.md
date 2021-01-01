# To-do app

How to start:
Note: You will need postgreSQL database to use this application because some queries are specific to that DBMS.

1. Once you download the project, open a new terminal.
2. Run `npm install` in the terminal.
3. Open PGadmin on your computer which will open a new browser tab. Create a new database called `todo-app`
4. In the `server` folder copy `.env.template` and duplicate it to a new file called `.env`. Fill in the database username and password from the database you created using pgAdmin. Generate a random string for using as `ACCESS_TOKEN_SECRET`.
5. Open an sql editor inside pgAdmin paste the code from the `database.sql` file. This will create the tables need for the application.
6. Back in vscode, open a new terminal. Run `npm run dev-ui` This will start the ui server.
7. Open another terminal. Run `npm run dev-server` This will start the database server.
8. Open `localhost:3000` in your browser.
9. Now you can start using the app!
