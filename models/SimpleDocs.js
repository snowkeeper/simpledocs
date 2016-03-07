var async = require('async');
var highlight = require('highlight.js');

 /**
 * model
 * 
 * create and register a model for this doc source
 *
 * ####Example:
 *
 *     SimpleDocs.model() 
 *
 * @method get
 * @api public
 */ 
module.exports = function() {

	var simpledocs = this;
	var model = simpledocs.get('simpledocs model');
	var config = simpledocs.get('simpledocs model config');
	var Types = this.keystone.Field.Types;
	var keystone = this.keystone;
	var	route = this.get('route');
	var wild = (route === '/' || route === '*' || route === '') ? '/' : route;
	var	bootstrap = wild + '/bootstrap';
	var material = wild + '/material';
	
	if(typeof config !== 'object')config = {};

	/**
	 * SimpleDocs Model
	 * ==========
	 */
	var SimpleDocModel = new keystone.List(model,{
			track:true,
			map: { name: 'title' },
			label: config.label || 'Simple Documentation',
			path: config.path || model + '-documentation',
			singular: config.singular || 'Document',
			plural: config.plural || 'Simple Documents',
			drilldown: 'parent',
			sortContext: model+':parent',
			defaultSort: 'parent order', 
	});

	SimpleDocModel.add({
		parent: { 
			type: Types.Relationship, 
			ref: model, many:false , 
			label: 'Parent Document', 
			initial: true
		},
		title: { 
			type: String,  
			index: true, 
			initial: true,
			required: true
		},
		menuTitle: { 
			type: String,  
			initial: false,
			required: false,
			note: 'String to use for menu displays.  Title will be used if not defined.'
		},
		slug: { 
			type: Types.Key,
			index: true,
			unique: true,
			note:'leave blank to auto-generate based on title.  Will be reformed uniquely if neccessary.'
		},
		display: {
			type: Types.Select, 
			default: 1, 
			numeric: true, 
			options: [
				{ value: 2, label: 'Html only' },
				{ value: 1, label: 'Markdown Only' },
				{ value: 3, label: 'Markdown then Html' },
				{ value: 4, label: 'Html then Markdown' }
			], 
			label: 'Content is', 
			emptyOption: false 
		},
		html: { 
			type: Types.Html,
			height: simpledocs.get('html height'), 
			dependsOn: { $or: { display: [2,3,4] } },  
			wysiwyg: simpledocs.get('wysiwyg'), 
			label: 'Document HTML Contents'  
		},
		markdown: { 
			type: Types.Markdown, 
			label: 'Document Markdown Contents', 
			dependsOn: { $or: { display: [1,3,4] } }, 
			height:250, 
			note:'here is an editor you can use to copy/paste... <a href="http://jbt.github.io/markdown-editor/" target="_blank">http://jbt.github.io/markdown-editor/</a>', 
			markedOptions: { 
				langPrefix: 'language-',
				highlight: function (code, lang, callback) {
					console.log('highlight code', code);
					callback(err, highlight.highlightAuto(code).value);
				}
			} 
		},
		links: {
			type: Types.Relationship,
			ref: model, 
			many:true , 
			label: 'Related Documents',  
		},
		externalLinks: {
			type: Types.Url,  
			many: true, 
			label: 'Related External Links' ,
			note:'separate links with a comma or space.'  
		},
		type: {
			type: Types.Select, 
			numeric: true, 
			default: 1, 
			options: [
				{ value: 1, label: 'Document Contents' }, 
				{ value: 2, label: 'List of Child Root Documents' }, 
				{ value: 3, label: 'Contents then List of Child Root Documents' }
			],
			label: 'Show:', 
			emptyOption: false 
		},
		sortBy: {
			type: Types.Select, 
			numeric: true, 
			options: [
				{ value: 1, label: 'Current Order if defined' },
				{ value: 2, label: 'Enter Number' }, 
				{ value: 3, label: 'Before Document' }, 
				{ value: 4, label: 'After Document' }, 
				{ value: 5, label: 'Set Manually for this Document Only' }
			], 
			label: 'Order Placement', 
			emptyOption: false 
		},
		sortNumber: { 
			dependsOn: { sortBy: 2 },
			type: String, 
			note: 'Accepts a number, prepend and append', 
			default: 'append',  
			index: true,  
			label: 'Sort order among other child documents'
		},
		sortBefore: { 
			dependsOn: { sortBy: 3 }, 
			type: Types.Relationship, 
			ref: model, 
			label: 'Before this Document'
		}, 
		sortAfter: { 
			dependsOn: { sortBy: 4 }, 
			type: Types.Relationship, 
			ref: model,  
			label: 'After this Document'
		},
		order: {
			dependsOn: { sortBy: 5 }, 
			type: Types.Number, 
			noedit:false, 
			index:true,
			label:'Order Manually',
			note:'only change this value if you need to manully set the order.  Try and let Order Placement order for you'
		},	
		currentOrder: {
			type: Types.Number, 
			noedit:true, 
			label:'Current Order' 
		},
		publish: {
			type: Types.Select, 
			default: 'published',  
			options: [
				{ value: 'published', label: 'Published' },
				{ value: 'draft', label: 'Draft' }, 
				{ value: 'archived', label: 'Archived' }
			], 
			label: 'Published documents are live on site', 
			emptyOption: false 
		},
	});
	
	SimpleDocModel.defaultColumns = 'title|30%, parent|30%,  slug, publish';

	// add text indexes 
	SimpleDocModel.schema.index({ 'markdown.html': 'text',  'title': 'text', 'html': 'text' });
	
	SimpleDocModel.relationship({ ref: model, refPath: 'parent', path: 'childof' ,label:'Child Documents'});
	SimpleDocModel.relationship({ ref: model, refPath: 'links', path: 'linkedto',label:'Showing links to' });
	
	/**
	 *  Statics
	 * =====
	*/
	SimpleDocModel.schema.statics.search = function search(term, cb) {
		var model = this; 
		console.log('search', term);
		model.find(
			{ $text: { $search: term } },
			{ score: { $meta: 'textScore' } }
		)
		.sort({ score: { $meta: 'textScore' }})
		.exec(function (err, output) {
			if (err) {
				console.log('search error', err);
				return cb(err);
			}
			return cb(null, output);
		
		});
	}
		
	SimpleDocModel.schema.statics.getPage = function getPage(slug,cb) {
		var model = this;
		//console.log('page model request',slug);
		model.findOne({slug:slug}).select('-__v').populate('parent','parent title slug order').populate('links','parent title slug order').lean().exec(function(err,doc) {
			if(err)return cb(err);
			return cb(null,doc);
		});
	}	
	
	SimpleDocModel.schema.statics.allInOne = function allInOne(slug, pages, cb) {
		var model = this;
		var list = [];
		if(!slug) {
			slug = simpledocs.get('homepage');
		}
		//console.log('page model request', slug);
		model.findOne({slug:slug}).select('-__v').exec(function(err,doc) {
			if(err) {
				return cb(err);
			}
			updatePageArray(pages, doc);
			model.find().select('-__v').populate('parent', 'parent title slug order').populate('links', 'parent title slug order').lean().exec(function(err,docs) {
				if(err) {
					return cb(err);
				}
				docs.forEach(function(v) {
					updatePageArray(pages, v);
				});
				return cb(null, pages);
			});
		});
		
		function updatePageArray (pages, page) {
			if(!page || !pages) {
				return false;
			}
			var ii = pages.indexOf(page._id.toString());
			if (ii === -1) {
				//console.log('ID not found : ' + page._id );
			} else if (ii > -1) {
				//console.log(page._id + ' exists in the pages collection at index ' + ii);
				pages[ii] = page
			}
		}
	}
	
	SimpleDocModel.schema.statics.getTree = function getTree(cb) {
		
		var model = this;
		var menu = {};
		var pageList = [];
		var tree;
			
		var createMenu = function(pages, pushto, callback) {
			/* we get a object of menu items
			 * push results to pushto
			 * */
			//console.log('pages',pages)
			if(typeof pages === 'object') {
				//console.log('our list of documents');
				async.each(pages.docs,function(v,next) {
					//console.log('each document ',v.slug);
					var newv = v;
					pageList.push(v._id.toString());
					newv.documents = [];
					var pushed = pushto.push(newv);
					//console.log('pushed ',pushed);
					if(menu[v._id]) {
						if(menu[v._id].docs instanceof Array) {
							//console.log(v.slug,' has child docs so create menu items');
							var tmenu = menu[v._id];
							createMenu(tmenu,pushto[pushed-1].documents,next);
						} else {
							next();
						}
					} else {
						next();
					}
				},function(err) {
					callback(tree)
				});
			}
		}
		// group our docs by parent, roots will be null
		model.aggregate(
		    //{ $unwind: "$msgs" },   // break the 'msgs' array into subdocuments
		    { $match: { "publish" : 'published'} }, // match the filed in subdocuments
		    { $sort: {"parent" : -1} },
		    { $sort: {"order" : 1} },
		    { $project: { id: 1, title:1, menuTitle:1, parent:1 ,order:1, slug:1}}, // project the fileds 
		    { $group : { _id : "$parent", pages: { $push: "$title"}, slugs: { $push: "$slug"}, docs : { $push : "$$ROOT" } }},
		    //{ $sort: {"order" : -1} },
		    function (err, pages ) { 
			if(err) console.log(err);
			if(pages !== null && pages instanceof Array) {
				pages.reverse();
				
				pages.forEach(function(v) {
					//console.log(v._id);				
					if(v._id === null) {
						// console.log('root documents', v);
						tree = v.docs.map(function(dd) {
							return { 
								id: dd._id,
								title: dd.title,
								menuTitle: dd.menuTitle,
								slug: dd.slug,
								parent: v._id,
								documents: []
							};
						}).filter(function(vv){
							return vv !== undefined
						});
					} else {
						menu[v._id] = v;
					}	
				});
				//console.log('tree',tree);
				/* loop through the roots and run a recursive to build the menu into itself */
				if(tree instanceof Array) {
					tree.forEach(function(v,k) {
						if(menu[v.id]) {
							//console.log('we have menu items for ',v.slug,' so add to tree index ',k);
							var tmenu = menu[v.id];
							pageList.push(v.id.toString());
							createMenu(tmenu, tree[k].documents, function(t) {});
							
						}
					});
					cb(null, tree, menu, pageList);
					
				} else {
					cb('no tree');
				}
				
				
			}
			
		});/*end aggregate*/
	}	
	/**
	 *  Pre
	 * =====
	*/
	SimpleDocModel.schema.pre('save', function(next) {
		var doc = this,
			sort = doc.sortNumber,
			sortN = parseFloat(doc.sortNumber);
		
		if(isNaN(sortN)) {
			sortN = 0;
		}
		
		if(!doc.slug) {
			doc.slug = doc.title.toLowerCase();
		}
		
		if(!doc.menuTitle) {
			doc.menuTitle = doc.title;
		}
		
		//*do the order sorting */
		if(doc.order && (doc.sortBy === '' || doc.sortBy === 5)) {
			next();
		}
		
		/* increment the docs */
		var inc = function(doc,cb) {
			/* populate the parent object to get its order and update parentOrder, then increment */
			//console.log('increment order',doc.order,doc.parent);
			var plus = doc.order;
			var minus = doc.order;
			keystone.list(model).model.find({ "parent" : doc.parent }).sort("order").exec(function(err,coll){
				if(err){
					console.log('increment failed',err);
					return cb("Error in incrementing." + err);
				}
				var l = {};
				var i = 1;
				coll.forEach(function(v,k) {					
					if(doc.order === i) i++;
					var nn = doc.key !== v.key ? i : doc.order;
					if(doc.key !== v.key) {
						//console.log('update',v.title,i,doc._id===v._id);
						keystone.list(model).model.update({ _id : v._id},{order:i,currentOrder:i,sortNumber:i}).exec(function(err){});
						i++;
					}
					l[nn] =  v.slug;
					
				});
				//console.log(l);
					
				return cb(null);
			});
					
			
		}
		
		var finish = function(err) {
			doc.sortNumber = doc.order;
			doc.currentOrder = doc.order;
			doc.sortBefore = undefined;
			doc.sortAfter = undefined;
			if(doc.sortBy === 1) {
				console.log('finished doc, skipped increment',doc.order);
				next();
			
			} else {
				doc.sortBy = 1;
				inc(doc,function(err){
					if(err)console.log('Erorr',err);
					console.log('finished doc',doc.order);
					next();
			
				});
			}
		}		
				
		/* set the sort order */
		if(doc.sortBy === 1 ) {
			
			console.log('use current sort order');
			return finish();
			
		} else if(doc.sortBy > 2) {
			
			console.log('sort before or after',doc.sortBefore,doc.sortAfter);
			
			if(!doc.sortBefore && !doc.sortAfter)return finish(); 
			
			// grab the order number of the selected doc
			var parent = doc.sortBy === 3 ? doc.sortBefore : doc.sortAfter;
			keystone.list(model).model.count({parent:doc.parent},function(err,count) {
				keystone.list(model).model.findOne({"_id":parent}).select('order title').exec(function(err,point) {
					if(err)return finish(err);
					
					if(!point || point === null) return finish();
					
					console.log('current order',doc.order);
					
					if(doc.sortBy === 3 ) {
						/* this is a before*/
						if(point.order === 1 ) {
							doc.order = point.order
						} else if(doc.order < point.order) {
							doc.order = point.order - 1;
						} else if(point.order === count) { 
							doc.order = point.order - 1;
						} else {
							doc.order = point.order
						}
					} else {
						/* this is an after*/
						if(point.order === 1  || doc.order > point.order) {
							doc.order = point.order + 1
						} else if(point.order === count || doc.order < point.order) {
							doc.order = point.order;
						} else {
							doc.order = point.order
						}
					}
					
					console.log('parent sort',doc.sortBy,point.title,point.order,'total',count,'new order',doc.order);
					return finish()
				});
			});
			
		} else {
			console.log('sort by number');
			// grab the total number of rows for the parent
			keystone.list(model).model.count({parent:doc.parent},function(err,count) {
				//console.log(parent,'sort',sort,'sortN',sortN,'count',count);
				if(count === 0 && doc.parent != null && doc.parent != undefined) {
					doc.order = 1;	
				}
				if(sort	=== 'prepend' || (sortN === 0 && sort === '0')) {
					doc.order = doc.parent != null && doc.parent != undefined ? 1 : 0;
					
				} else if(sort === 'append' || (sortN === 0 && sort !== '0')) {
					doc.order = count;
					
				} else if(sortN) {
					if(sortN > count) {
						doc.order = count;
					} else {
						doc.order = sortN;
					}
				} else {
					doc.order = count + 1;
					
				}
				return finish(err);	
			});
		}
	});

	/**
	 * Registration
	 **/
	SimpleDocModel.register();
	
	
	/**
	 * Ensure indexes
	 * */
	if(simpledocs.get('ensure indexes')) {
		SimpleDocModel.model.ensureIndexes(function(err) {
			if(err) {
				console.log('ERROR ensuring indexes', err, config.label);
			}
		});
	}
	/**
	 * Nav
	 **/
	var nav = keystone.get('nav');
	nav = typeof nav === 'object' ? nav : {};
	if(nav.documents instanceof Array) {
		nav.documents.push(SimpleDocModel.path);
	} else {
		nav['documents'] = [SimpleDocModel.path];
	}
	if(!nav['packages']) {
		nav['packages'] = [{
			path: material + '/gh-pages',
			label: SimpleDocModel.path + ' gh-pages',
			key: SimpleDocModel.path + 'ghpages',
		}];
	} else {
		nav['packages'].push({
			path: material + '/gh-pages',
			label: SimpleDocModel.path + ' gh-pages',
			key: SimpleDocModel.path + 'ghpages',
		});
	}
	keystone.set('nav', nav);
}
