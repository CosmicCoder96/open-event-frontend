import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  classNames : ['ui', 'fluid', 'card'],
  actions    : {
    openAddUserRoleModal() {
      this.set('isAddUserRoleModalOpen', true);
    },

    addUserRole() {
      const newRole = this.get('store').createRecord('role-invite', {
        email    : this.get('email'),
        roleName : this.get('roleName'),
        event    : this.get('data.event')
      });
      this.get('data.roleInvites').addObject(newRole);
      newRole.save();
      this.set('isAddUserRoleModalOpen', false);
    }
  }
});
