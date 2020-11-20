import Pg from "pg";
import polka from "polka";
import { sql } from 'sqliterally'

const app = polka();
app.get('/', (req, res) => {
    res.end('Hello World!');
});

app.listen(3000);

const main = async() => {
  const client = new Pg.Client({
    user: "",
    password: "",
    database: "",
})
await client.connect() 
const res = await client.query(sql`
SELECT *
FROM "table"
`)
console.log(res)
}
main();