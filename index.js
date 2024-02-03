const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const _ = require('lodash');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/process', async (req, res) => {
	try {
		const filePath = req.body.filePath;

		if (!filePath) {
			return res.status(400).json({ error: 'O caminho do arquivo CSV é obrigatório.' });
		}

		const data = [];

		await new Promise((resolve, reject) => {
			const stream = fs.createReadStream(filePath);

			stream.on('error', (error) => {
				reject(error);
			});

			stream
				.pipe(csv({ separator: ',' }))
				.on('data', (row) => {
					data.push(row);
				})
				.on('end', () => {
					resolve();
				})
				.on('error', (error) => {
					reject(error);
				});
		});

		const groupedData = _.groupBy(data, 'Fornecedor');
		const result = Object.entries(groupedData).map(([fornecedor, produtos]) => ({
			Fornecedor: fornecedor || 'N/A',
			Produtos: produtos
				.filter((produto) => produto.Descontinuado.toLowerCase() !== 'sim')
				.map(({ Fornecedor, ...produto }) => produto),
		}));

		res.json(result);
	} catch (error) {
		console.error('Erro durante o processamento do CSV:', error);
		res.status(500).json({ error: `Ocorreu um erro durante o processamento do CSV: ${error.message}` });
	}
});

app.listen(port, () => {
	console.log(`Servidor rodando em http://localhost:${port}`);
});
