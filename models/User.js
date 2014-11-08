var keystone = require('keystone'),
	Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */

var User = new keystone.List('User');

User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: String, initial: true, required: true, index: true, label: 'username', unique:true },
	realEmail: { type: Types.Email, initial: true,  index: true, label:'email' , unique:true},
	password: { type: Types.Password, initial: true, required: true }
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },

});





// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function() {
	return this.isAdmin;
});
User.schema.virtual('fullname').get(function() {
	return this.name.first + ' ' + this.name.last;
});


/**
 *  Statics
 * */

/**
 * Methods
 * =======
*/

/**
 * Registration
 */

User.defaultColumns = 'name, email, realEmail, isAdmin';
User.register();
