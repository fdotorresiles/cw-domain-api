import { Router } from 'express';
import internal from './internal';

var modulevar = require('../variables');
const Datastore = require('@google-cloud/datastore');
const datastore = Datastore();

export default ({ config, db }) => {
	let api = Router();

	// mount the facets resource
	api.use('/internal', internal({ config, db }));

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json( { 'status': modulevar.getCounter() } );
	});

	api.get('/create', (req, res) => {

		const taskKey = datastore.key('Task');
		const entity = {
			key: taskKey,
			data: [{
					name: 'created',
					value: new Date().toJSON()
				},
				{
					name: modulevar.getCounter(),
					excludeFromIndexes: true
				},
				{
					name: 'done',
					value: true
				}]
		};
		datastore.save(entity)
		.then(() => {
			res.json( { 'ok': entity.key } );
		})
		.catch((err) => {
			res.json( { 'status': err } );
		});
	});

	return api;
}
