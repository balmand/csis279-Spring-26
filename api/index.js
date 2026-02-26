const express = require('express');
const bodyParser = require('body-parser');
// security package
const cors = require('cors');
const {Pool} = require('pg');

const app = express();

// enable cors for all request
app.use(cors());

app.use(bodyParser.json());


const pool = new Pool({
	user: "postgres",
	password: "postgres",
	database: "csis_279_spring_26_db",
	port: 5432,
});

// READ ALL
app.get("/clients", async (req, res) => {
	try{
		const result = await pool.query("SELECT * FROM clients");
		res.status(200).json(result.rows);
	}catch(e){
		res.status(500).json({error: e.message});
	}
});

// INSERT USER
app.post("/clients", async (req, res) => {
	try {
		const { name, email } = req.body;
		if(!name || !email){
			res.status(400).json("missing parameters");
		}
		const result = await pool.query(`INSERT INTO clients (client_name, client_email)
		VALUES ($1, $2) RETURNING *`, [name, email]);
		res.status(201).json(result.rows[0]);
	} catch (e) {
		res.status(500).json({ message: e.message });
	}

});

// Get client by id
app.get("/clients/:id", async (req, res)=>{
	const {id} = req.params;
	const result = await pool.query(`SELECT * FROM clients WHERE client_id = $1`, [id]);
	res.status(200).json(result.rows[0]);
})

//UPDATE
app.put("/clients/:id", async (req, res)=>{
	const {name, email} = req.body;
	const {id} = req.params;

	const result = await pool.query(`UPDATE clients
		SET client_name = $1, client_email = $2 WHERE client_id = $3
		RETURNING *`, [name, email, id]);
	
	res.status(201).json(result.rows[0]);
});

// DELETE
app.delete("/clients/:id", async (req, res) => {
	const {id} = req.params;
	await pool.query(`DELETE FROM clients
		WHERE client_id = $1`, [id]);
	res.status(204).json({success: true});
});


// READ ALL
app.get("/departments", async (req, res) => {
	try{
		const result = await pool.query(`SELECT * FROM public.departments
ORDER BY dep_id ASC `);
		res.status(200).json(result.rows);
	}catch(e){
		console.log(e);
		res.status(500).json({error: e.message});
	}
});

// INSERT USER
app.post("/departments", async (req, res) => {
	try {
		const { name} = req.body;
		if(!name){
			res.status(400).json("missing parameters");
		}
		const result = await pool.query(`INSERT INTO departments (dep_name)
		VALUES ($1) RETURNING *`, [name]);
		res.status(201).json(result.rows[0]);
	} catch (e) {
		res.status(500).json({ message: e.message });
	}

});

// Get client by id
app.get("/departments/:id", async (req, res)=>{
	const {id} = req.params;
	const result = await pool.query(`SELECT * FROM departments WHERE dep_id = $1`, [id]);
	res.status(200).json(result.rows[0]);
})

//UPDATE
app.put("/departments/:id", async (req, res)=>{
	const {name} = req.body;
	const {id} = req.params;
	const result = await pool.query(`UPDATE departments
		SET dep_name = $1 WHERE dep_id = $2
		RETURNING *`, [name, id]);
	
	res.status(201).json(result.rows[0]);
});

// DELETE
app.delete("/departments/:id", async (req, res) => {
	const {id} = req.params;
	await pool.query(`DELETE FROM departments
		WHERE dep_id = $1`, [id]);
	res.status(204).json({success: true});
});

const PORT = 3001;
app.listen(PORT, ()=>{
    console.log(`Server running on ${PORT}`)
});