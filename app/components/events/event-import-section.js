import Ember from 'ember';
import FormMixin from 'open-event-frontend/mixins/form';

const { Component, run } = Ember;

export default Component.extend(FormMixin, {
  classNames: ['ui', 'stackable', 'centered', 'grid'],
  getValidationRules() {
    return {
      inline : true,
      delay  : false,
      on     : 'blur',
      fields : {
        file: {
          identifier : 'file',
          rules      : [
            {
              type   : 'empty',
              prompt : this.l10n.t('Please upload a file')
            },
            {
              type   : 'regExp',
              value  : '/^(.*.((zip|xml|ical|ics|xcal)$))?[^.]*$/i',
              prompt : this.l10n.t('Please upload a file in suggested format')
            }
          ]
        }
      }
    };
  },
  eventDownloadUrl   : '',
  eventExportStatus  : 'Event export not yet started.',
  isDownloadDisabled : true,
  requestLoop(exportJobInfo) {
    run.later(() => {
      this.get('loader')
        .load(exportJobInfo.task_url, { withoutPrefix: true })
        .then(exportJobStatus => {
          if (exportJobStatus.state === 'SUCCESS') {
            this.set('isLoading', false);
            this.set('isDownloadDisabled', false);
            this.set('eventDownloadUrl', exportJobStatus.result.download_url);
            this.set('eventExportStatus', exportJobStatus.state);
            this.get('notify').success(this.l10n.t('Event exported.'));
          } else if (exportJobStatus.state === 'WAITING') {
            this.requestLoop(exportJobInfo);
            this.set('eventExportStatus', exportJobStatus.state);
            this.get('notify').alert(this.l10n.t('Event export is going on.'));
          } else {
            this.set('isLoading', false);
            this.set('eventExportStatus', exportJobStatus.state);
            this.get('notify').error(this.l10n.t('Event export failed.'));
          }
        })
        .catch(() => {
          this.set('isLoading', false);
          this.set('eventExportStatus', 'FAILURE');
          this.get('notify').error(this.l10n.t('Event export failed.'));
        });
    }, 3000);
  },

  actions: {
    submit() {
      this.onValid(() => {
        this.set('isLoading', true);
        let payload = this.get('data');
        this.get('loader')
          .post(`/events/import/json`, payload)
          .then(exportJobInfo => {
            this.requestLoop(exportJobInfo);
          })
          .catch(() => {
            this.get('notify').error(this.l10n.t('Unexpected error occurred.'));
          });
      });
    }
  }
});
