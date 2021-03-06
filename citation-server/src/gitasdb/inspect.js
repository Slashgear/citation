import path from 'path';

import _ from 'lodash';
import fs from 'fs-promise';
import mergeDeep from 'merge-deep';
import winston from 'winston';

import {workingDirectory} from './constants';

const logger = winston.loggers.get('GitUpdater');

export async function inspectObject(type, id) {
	try {
		logger.debug(`inspect object ${type} ${id}`);
		const objectPath = path.resolve(workingDirectory, 'master', type, id);
		const objectFiles = await fs.readdir(objectPath);
		const objectFields = await Promise.all(objectFiles.map(async file => {
			const ext = path.extname(file);
			const key = path.basename(file, ext);
			if (ext === '.json') {
				const contentBuffer = await fs.readFile(path.resolve(objectPath, file));
				const content = JSON.parse(contentBuffer.toString());
				if (content.__role__ === 'link') {
					const {collection, id} = content.link;
					const inspection = await inspectObject(collection, id);
					return {[key]: inspection};
				}
				if (content.__role__ === 'links') {
					const linksInspection = await Promise.all(content.links.map(async link => {
						const {collection, id} = link;
						const inspection = await inspectObject(collection, id);
						return {[key]: {[`... on ${collection}`]: inspection}};
					}));
					return mergeDeep({}, ...linksInspection);
				}
			}
			return key;
		}));
		return objectFields;
	} catch (error) {
		logger.error(`Gitasdb inspect error ${error}`);
		throw error;
	}
}

export function graphqlQuerySerialize(query) {
	try {
		if (_.isArray(query)) {
			return `${query.map(graphqlQuerySerialize).join(', ')}`;
		}

		if (_.isObject(query)) {
			return _.map(query, (value, key) => {
				return `${key} {${graphqlQuerySerialize(value)}}`;
			}).join(', ');
		}

		return query;
	} catch (error) {
		logger.error(`Gitasdb GraphQL Query Serialize error ${error}`);
		throw error;
	}
}
