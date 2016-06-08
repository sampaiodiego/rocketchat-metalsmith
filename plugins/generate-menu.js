var _ = require('underscore');
var slugifyPath = require('slugify-path').default;

function createTree(fileTree, items) {
	var item = items.splice(0, 1);

	if (items.length > 0) {

		if (!fileTree[item]) {
			fileTree[item] = {};
		}
		createTree(fileTree[item], items);
	// } else {
	// 	fileTree[item] = {};
	}
}

function generateMenu() {
	return function(files, metalsmith, done) {
		var fileTree = {};

		Object.keys(files).forEach(function(file) {
			var data = files[file];

			var fileParts = data.originalName.split('/');
			var totalParts = fileParts.length;

			createTree(fileTree, fileParts);
		});

		var level = 1;
		var folders = [];
		Object.keys(fileTree).forEach(function(item) {
			var title = item.replace(/^[0-9]+\. /, '');
			folders.push({
				label: title,
				sortTitle: item,
				link: '/' + slugifyPath(title),
				class: 'guide-nav-item'
			});

			Object.keys(fileTree[item]).forEach(function(subitem) {
				var subtitle = subitem.replace(/^[0-9]+\. /, '');
				folders.push({
					label: subtitle,
					sortTitle: item + '-' + subitem,
					link: '/' + slugifyPath(title) + '/' + slugifyPath(subtitle),
					class: 'guide-nav-item level-2'
				});

				Object.keys(fileTree[item][subitem]).forEach(function(subitem2) {
					var subtitle2 = subitem2.replace(/^[0-9]+\. /, '');
					folders.push({
						label: subtitle2,
						sortTitle: item + '-' + subitem + '-' + subitem2,
						link: '/' + slugifyPath(title) + '/' + slugifyPath(subtitle2),
						class: 'guide-nav-item level-3'
					});
				});
			});
		});

		var newFolders = _.sortBy(folders, 'sortTitle');
		for (var file in files) {
			files[file].mainNav = newFolders;
		}

		done();
	}
}

function generateMenuOld() {
	return function(files, metalsmith, done) {
		var folders = [];
		var unique = {};

		for (var file in files) {
			var data = files[file];
			var slash = file.indexOf('/');
			if (!slash) {
				continue;
			}
			var oneLevel = file.substr(0, file.indexOf('/'));

			if (oneLevel == '' || oneLevel == '.git') {
				continue;
			}

			var secondLevel = file.substr(file.indexOf('/') + 1);
			// console.log('secondLevel ->',secondLevel);
			secondLevel = secondLevel.substr(0, secondLevel.indexOf('/'));

			if (secondLevel != '') {

				if (unique[oneLevel+'/'+secondLevel]) {
					continue;
				}
				unique[oneLevel+'/'+secondLevel] = 1;

				folders.push({
					label: secondLevel.replace(/(^|\/)[0-9\. ]+/g, '$1'),
					sortTitle: data.originalName,
					link: '/' + oneLevel+'/'+secondLevel + '/index.html',
					class: 'guide-nav-item level-2'
				});
			}

			if (unique[oneLevel]) {
				continue;
			}
			unique[oneLevel] = 1;

			folders.push({
				label: oneLevel.replace(/(^|\/)[0-9\. ]+/g, '$1'),
				sortTitle: data.originalName,
				link: '/' + oneLevel + '/index.html',
				class: 'guide-nav-item'
			});
		}

		// console.log('folders ->',folders);

		// files.forEach(function(file) {
		//   folders[file.substr(0,file.lastIndexOf('/'))] = 1;
		// });

		var newFolders = _.sortBy(folders, 'sortTitle');

		// console.log('newFolders ->',newFolders);

		// newFolders.forEach(function(folder, i, list) {
		// 	list[i] = ;
		// });

		// console.log('newFolders->', newFolders);

		for (var file in files) {
			files[file].mainNav = newFolders;
		}

		done();
	}
};

module.exports = generateMenu;

