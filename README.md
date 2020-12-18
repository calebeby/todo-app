# To-do app
How to start: 
Note: You will need postgreSQL database to use this application because some queries are specific to that DBMS.
1. Once you download the project, open a new terminal.
2. cd into the server folder. Run 'npm install' in the terminal.
3. Once it is finished, cd into the ui folder and repeat.
4. Open PGadmin on your computer which will open a new browser tab. Create a new database called 'todo-app'
4. Open an sql editor inside PGadmin paste the code from the 'database.sql' file. This will create the tables need for the application.
4. Back in vscode, open a new terminal. cd into the ui folder again and run 'npm run dev' This will start the ui server.
5. Open another terminal. cd into the server folder and run 'nodemon .' This will start the database server.
6. Open localhost:3000 in your browser.
7. Now you can start using the app!
