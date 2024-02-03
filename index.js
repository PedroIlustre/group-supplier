const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const _ = require('lodash');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/process', (req, res) => {
	const filePath = req.body.filePath;

	if (!filePath) {
		return res.status(400).json({ error: 'O caminho do arquivo CSV é obrigatório.' });
	}

	const data = [];

	fs.createReadStream(filePath)
		.pipe(csv({ separator: '\t' }))
		.on('data', (row) => {
			data.push(row);
		})
		.on('end', () => {
			const groupedData = _.groupBy(data, 'Fornecedor');
			const result = Object.entries(groupedData).map(([fornecedor, produtos]) => ({
				Fornecedor: fornecedor,
				Produtos: produtos.map((produto) => ({
					Categoria: produto['Categoria'],
					ID: produto['ID Produto'],
					Codigo: produto['Código'],
					CodigoBarras: produto['Código de Barras'],
					Produto: produto['Produto'],
					Descontinuado: produto['Descontinuado'],
					UnitarioCusto: produto['Unitário - Custo'],
				})),
			}));

			res.json(result);
		});
});


app.listen(port, () => {
	console.log(`Servidor rodando em http://localhost:${port}`);
});
