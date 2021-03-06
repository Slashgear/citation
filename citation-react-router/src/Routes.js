import React, {Component, PropTypes} from 'react';
import {Route} from 'react-router-dom';
import queries from './queries';
import Default from './Default';

export default class Routes extends Component {
	static propTypes = {
		serverUrl: PropTypes.string.isRequired,
		components: PropTypes.object.isRequired,
		pages: PropTypes.array.isRequired,
		match: PropTypes.object.isRequired
	}

	constructor() {
		super();
		this.matchRenderer = this.matchRenderer.bind(this);
		this.state = {};
	}

	componentWillMount() {
		if (window && window.__contents__) {
			this.setState({content: window.__contents__[this.props.match.url]});
		}
	}

	async loadPageContent(page) {
		if (this.state.content === undefined && page !== undefined) {
			await Promise.resolve();
			this.setState({content: null});
			const content = await queries.queryComponentTree(this.props.serverUrl, page.component);
			this.setState({content});
		}
	}

	createElement(page, {type, data, children = []}, i, matchProps) {
		let Component = this.props.components[type];

		if (Component === undefined) {
			Component = Default;
		}

		let childPage;
		if (Array.isArray(page.children)) {
			childPage = <Routes {...this.props} {...matchProps} pages={page.children}/>;
		}
		return (
			<Component key={i} data={data} pages={this.props.pages} childPage={childPage}>
				{children.map((child, i) => this.createElement(page, child, i, matchProps))}
			</Component>
		);
	}

	matchRenderer(page) {
		return matchProps => {
			if (this.state.content === undefined || this.state.content === null) {
				this.loadPageContent(page);
				return <span/>;
			}
			return this.createElement(page, this.state.content, 0, matchProps);
		};
	}

	render() {
		return (
			<div>
				{this.props.pages.map((page, i) => {
					const path = `${this.props.match.url}/${page.slug}`.replace(/\/\//g, '/');
					return <Route key={i} path={path} render={this.matchRenderer(page)}/>;
				})}
			</div>
		);
	}
}
