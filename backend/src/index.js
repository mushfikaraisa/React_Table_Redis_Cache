import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser, { json } from 'body-parser';
import express from 'express';
import responseTime from 'response-time';
import redis from 'redis';

const app = express();
app.server = http.createServer(app);

// create and connect redis client to local instance.
const client = redis.createClient();

// Print redis errors to the console
client.on('error', (err) => {
	console.log("Error " + err);
});

// use response-time as a middleware
app.use(responseTime());
// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: ["Link"]
}));

app.use(bodyParser.json({
	limit: "100mb"
}));

app.get('/api/data', (req, res) => {
	console.log("api/data");
	return client.get(`data`, (err, result) => {
		if (err) return res.status(400).json({ success: false, err })
		if (result) return res.status(200).json({ success: true, data: JSON.parse(result).data });
	});
});

app.post('/api/add', (req, res) => {
	console.log(req.body);
	client.get(`data`, (err, result) => {
		if (err) return res.status(400).json({ success: false, err })
		if (result && result.length > 0) {
			console.log(result);
			const existingData = JSON.parse(result).data;
			const newData = [...existingData, req.body]
			console.log(newData);
			client.setex(`data`, 60 * 60 * 24 * 20, JSON.stringify({ source: 'Redis Cache', data: newData }));
			return res.status(200).json({ success: true, data: newData });
		}
		else{
			client.setex(`data`,  60 * 60 * 24 * 20, JSON.stringify({ source: 'Redis Cache', data: [req.body] }));
			return res.status(200).json({ success: true, data: req.body });
		}
	});

});

app.delete('/api/delete/:id', (req, res) => {
	const id = req.params.id
	client.get(`data`, (err, result) => {
		if (err) return res.status(400).json({ success: false, err })
		if (result && result.length > 0) {
			console.log(result);
			const existingData = JSON.parse(result).data;
			const newcompanies = [...existingData];
			const index = existingData.findIndex((company) => company.id === id);
			newcompanies.splice(index, 1);
			const newData = [...newcompanies]
			console.log(newData);
			client.setex(`data`,  60 * 60 * 24 * 20, JSON.stringify({ source: 'Redis Cache', data: newData }));
			return res.status(200).json({ success: true, data: newData });
		}
		
	});

});

app.server.listen(process.env.PORT || 8080, () => {
	console.log(`Started on port ${app.server.address().port}`);
});

export default app;
