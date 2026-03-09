const express = require('express');
const bodyParser = require('body-parser');
// security package
const cors = require('cors');
const {Pool} = require('pg');
const bcrypt = require('bcryptjs');

class APIError extends Error {
  constructor(code, message, status, details) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}


const isInvalidString = (input) => {
	return typeof input !== 'string' || input.trim().length === 0;
}

const isInvalidID = (input) => {
	const ID = parseInt(input, 10);
	return Number.isNaN(ID);
}

const SALT_ROUNDS = 10;

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

// AUtH

// POST /auth/register
app.post("/auth/register", async (req, res, next) => {
	try {
		const { client_name, client_email, client_dob, password } = req.body;
		var isInvalid = false;
		if (!client_name || !client_email || !password) {
			return next(new APIError('MISSING_INFORMATION', 'Your name, email and password are required.', 400, 'One of the parameters is missing.'));
		}

		if (isInvalidString(client_name)) isInvalid = true;
		if (isInvalidString(client_email)) isInvalid = true;
		if (isInvalidString(password)) isInvalid = true;

		if (isInvalid) {
			return next(new APIError('INVALID_DATA', 'Your inputs include incorrect data types.', 400, 'Some of the parameters are not like the others...'))
		}

		const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
		const result = await pool.query(
			`INSERT INTO clients (client_name, client_email, client_dob, password_hash)
			 VALUES ($1, $2, $3, $4)
			 RETURNING client_id, client_name, client_email, client_dob`,
			[client_name, client_email, client_dob || null, password_hash]
		);
		console.log(result.rows[0]);
		res.status(201).json(result.rows[0]);
	} catch (e) {
		next(e);
	}
});

// POST /auth/login
app.post("/auth/login", async (req, res, next) => {
	try {
		const { client_email, password } = req.body;
		if (!client_email || !password) {
			return next(new APIError('MISSING_PARAMETER', 'Your email and password are required.', 400, 'One of the parameters is missisng.'));
		}
		var isInvalid = false;
		if (isInvalidString(client_email)) isInvalid = true;
		if (isInvalidString(password)) isInvalid = true;

		if (isInvalid) {
			return next(new APIError('INVALID_DATA', 'Your inputs include incorrect data types.', 400, 'Your parameters need to follow their correct data type.'));
		}

		const result = await pool.query(
			`SELECT * FROM clients WHERE client_email = $1`,
			[client_email]
		);
		const client = result.rows[0];
		if (!client) {
			return next(new APIError('INVALID_INFORMATION', 'Your email is invalid.', 401, 'Your email does not exist.'))
		}
		const match = await bcrypt.compare(password, client.password_hash);
		if (!match) {
			return next(new APIError('INVALID_INFORMATION', 'Your password is invalid.', 401, 'Your password does not match.'))
		}
		const { password_hash, ...safeClient } = client;
		res.status(200).json({ authenticated: true, client: safeClient });
	} catch (e) {
		next(e);
	}
});

//CLIENTS

// READ ALL
app.get("/clients", async (req, res, next) => {
	try {
		const result = await pool.query("SELECT client_id, client_name, client_email, client_dob FROM clients");
		res.status(200).json(result.rows);
	} catch(e) {
		next(e);
	}
});

// INSERT USER
app.post("/clients", async (req, res, next) => {
	try {
		const { name, email } = req.body;
		if (!name || !email) {
			return next(new APIError('MISSING_PARAMETER', 'A parameter is missing.', 400, 'One of the parameters does not contain any data.'))
		}
		var isInvalid = false;
		if (isInvalidString(name)) isInvalid = true;
		if (isInvalidString(email)) isInvalid = true;
		
		if (isInvalid) {
			return next(new APIError('INVALID_DATA', 'Your inputs include incorrect data types', 400, 'Please fix.'));
		}
		const result = await pool.query(`INSERT INTO clients (client_name, client_email)
		VALUES ($1, $2) RETURNING client_id, client_name, client_email, client_dob`, [name, email]);
		res.status(201).json(result.rows[0]);
	} catch (e) {
		next(e);
	}

});

// Get client by id
app.get("/clients/:id", async (req, res, next) => {
	try {
		const {id} = req.params;

		if (isInvalidID(id)) {
			return next(new APIError('INVALID_DATA', 'The ID is invalid.', 400, 'The get function is very wrong.'))
		}
		const result = await pool.query(`SELECT client_id, client_name, client_email, client_dob FROM clients WHERE client_id = $1`, [id]);
		res.status(200).json(result.rows[0]);
	} catch (e) {
		next(e);
	}
})

//UPDATE
app.put("/clients/:id", async (req, res, next) => {
	try {
		const {name, email} = req.body;
		const {id} = req.params;
		var isInvalid = false;

		if (isInvalidString(name)) isInvalid = true;
		if (isInvalidString(email)) isInvalid = true;
		if (isInvalidID(id)) isInvalid = true;

		if (isInvalid) {
			return next(new APIError('INVALID_DATA', 'Your inputs include incorrect data types', 400, 'Your parameters need to follow the correct data type.'));
		}

		const result = await pool.query(`UPDATE clients
			SET client_name = $1, client_email = $2 WHERE client_id = $3
			RETURNING client_id, client_name, client_email, client_dob`, [name, email, id]);
		
		res.status(201).json(result.rows[0]);
	} catch (e) {
		next(e);
	}
});

// DELETE
app.delete("/clients/:id", async (req, res, next) => {
	try {
		const {id} = req.params;
		console.log(id);
		if (isInvalidID(id)) {
			return next(new APIError('INVALID_DATA', 'Your inputs include incorrect data types', 400, 'Your parameters need to follow the correct data type.'));
		}
		await pool.query(`DELETE FROM clients
			WHERE client_id = $1`, [id]);
		res.status(204).json({success: true});
	} catch (e) {
		next(e);
	}
});


//DEPARTMENTS

// READ ALL
app.get("/departments", async (req, res, next) => {
	try {
		const result = await pool.query(`SELECT * FROM public.departments
						ORDER BY dep_id ASC `);
		res.status(200).json(result.rows);
	} catch(e) {
		next(e);
	}
});

// INSERT USER
app.post("/departments", async (req, res, next) => {
	try {
		const { name } = req.body;
		if (!name) {
			return next(new APIError('MISSING_PARAMETER', 'A parameter is missing.', 400, 'One of the parameters does not contain any data.'));
		}
		if (isInvalidString(name)) {
			return next(new APIError('INVALID_DATA', 'Your inputs include incorrect data types', 400, 'Your parameters need to follow the correct data type.'));
		}
		const result = await pool.query(`INSERT INTO departments (dep_name)
		VALUES ($1) RETURNING *`, [name]);
		res.status(201).json(result.rows[0]);
	} catch (e) {
		next(e);
	}

});

// Get client by id
app.get("/departments/:id", async (req, res, next) => {
	try {
		const {id} = req.params;
		if (isInvalidID(id)) {
			return next(new APIError('INVALID_DATA', 'Your inputs include incorrect data types', 400, 'Your parameters need to follow the correct data type.'));
		}
		const result = await pool.query(`SELECT * FROM departments WHERE dep_id = $1`, [id]);
		res.status(200).json(result.rows[0]);
	} catch (e) {
		next(e);
	}
})

//UPDATE
app.put("/departments/:id", async (req, res, next) => {
	try {
		const {name} = req.body;
		const {id} = req.params;
		var isInvalid = false;

		if (isInvalidString(name)) isInvalid = true;
		if (isInvalidID(id)) isInvalid = true;
		if (isInvalid) {
			return next(new APIError('INVALID_DATA', 'Your inputs include incorrect data types', 400, 'Your parameters need to follow the correct data type.'));
		}
		const result = await pool.query(`UPDATE departments
			SET dep_name = $1 WHERE dep_id = $2
			RETURNING *`, [name, id]);
		
		res.status(201).json(result.rows[0]);
	} catch (e) {
		next(e);
	}
});

// DELETE
app.delete("/departments/:id", async (req, res) => {
	try {
		const {id} = req.params;
		if (isInvalidID(id)) {
			return next(new APIError('INVALID_DATA', 'Your inputs include incorrect data types', 400, 'Your parameters need to follow the correct data type.'));
		}
		await pool.query(`DELETE FROM departments
			WHERE dep_id = $1`, [id]);
		res.status(204).json({success: true});
	} catch (e) {
		next(e);
	}
});

app.use((e, req, res, next) => {
	console.error("An API error has occured: ", e);
  if (e instanceof APIError) {
    res.status(e.status).json({
      code: e.code,
      message: e.message,
      details: e.details
    });
  } else {
	res.status(500).json({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong on the server.',
        details: e.message
    });
  }
});

const PORT = 3001;
app.listen(PORT, ()=>{
    console.log(`Server running on ${PORT}`)
});