/**
 * User Model
 * ==========
 */
module.exports = function(keystone) {

	var Types = keystone.Field.Types;
	var simpledocs = this;
	var User = new keystone.List(keystone.get('user model'));

	User.add({
		name: { type: Types.Name, required: true, index: true },
		// email: { type: String, initial: true,  index: true, label: 'username', unique:true },
		email: { type: Types.Email, initial: true, required: true, index: true, label:'email' , unique:true},
		password: { type: Types.Password, initial: true, required: true }
	}, 'Permissions', {
		isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },

	});

	/**
	 *  Virtuals
	 * */
	// Provide access to Keystone
	User.schema.virtual('canAccessKeystone').get(function() {
		return this.isAdmin;
	});
	User.schema.virtual('full name').get(function() {
		return this.name.first + ' ' + this.name.last;
	});

	/**
	 * Registration
	 */
	User.defaultColumns = 'name, email, realEmail, isAdmin';
	User.register();
	
	/**
	 * Nav
	 */
	var nav = keystone.get('nav');
	nav = typeof nav === 'object' ? nav : {};
	nav[User.key] = User.path
	keystone.set('nav', nav);
}
