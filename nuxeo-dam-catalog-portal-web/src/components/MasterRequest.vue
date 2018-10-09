<template>
<div>
  <!-- Action to request master access... -->
  <b-button v-b-modal.master-access-dialog
            class="btn-primary btn-lg"
            v-if="showRequestButton">
    <i class="zmdi zmdi-shield-security"></i> {{ $t("message.masterRequest-request-access") }}
  </b-button>

  <!-- Dialog for master access request... -->
  <b-modal id="master-access-dialog"
           v-bind:title='$t("message.masterRequest-request-access-title")'
           header-bg-variant="dark"
           header-text-variant="light"
           v-model="show"
           @ok="validateRequest"
           :ok-title='$t("message.masterRequest-ok")'
           :cancel-title='$t("message.masterRequest-cancel")'>
    <h3>{{ $t("message.masterRequest-reason-directive") }}</h3>
    <b-form-input v-model="masterAccessReason"
                  type="text"
                  required
                  :state="reasonState"
                  aria-describedby="reasonFeedback">
    </b-form-input>
    <b-form-invalid-feedback id="reasonFeedback">
      {{$t("message.masterRequest-validation-failed")}}
    </b-form-invalid-feedback>
  </b-modal>

  <!-- Badge if request is pending... -->
  <b-badge variant="warning"
           class="message message-lg"
           v-if="!isGuest && masterRequestPending">
    <i class="zmdi zmdi-shield-security"></i> {{ $t("message.masterRequest-request-pending") }}
  </b-badge>

  <!-- Badge if access has been granted... -->
  <b-badge variant="success"
           class="message message-lg"
           v-if="!isGuest && masterAccessGranted">
    <i class="zmdi zmdi-shield-security"></i> {{ $t("message.masterRequest-request-granted") }}
  </b-badge>
</div>
</template>

<script>
import {
  constants
} from '../constants.js'

export default {

  props: {
    assetId: {
      type: String
    }
  },

  computed: {
    // This validation is a bit cheesy, the user only needs to enter 2 characters...
    reasonState() {
      return this.masterAccessReason.length > 2 ? true : false
    }
  },

  data() {
    return {
      asset: {
        type: Object
      },
      isGuest: null,
      masterRequestPending: false,
      masterAccessGranted: false,
      showRequestButton: false,
      masterAccessReason: '',
      show: false
    }
  },

  created() {
    this.testGuest();
    this.handleRequestStatus();
  },

  watch: {
    assetId: function() {
      this.showRequestButton = false;
      this.masterRequestPending = false;
      this.masterAccessGranted = false;
      this.masterAccessReason = '';
      this.getAsset();
    },
    asset: function() {
      this.handleRequestStatus();
    }
  },

  methods: {
    // I can't remember why I'm fetching the document in a separate call :(
    getAsset: function() {
      if (this.assetId) {
        this.$nuxeo.request("id/" + this.assetId, {
            schemas: '',
            headers: {
              'enrichers.document': 'permissions'
            }
          })
          .get()
          .then(function(data) {
            this.asset = data;
          }.bind(this))
          .catch(function(error) {
            this.$toasted.error(this.$t('message.masterRequest-permissions-missing'), constants.TOASTED_DEFAULT_OPTIONS);
            throw error;
          }.bind(this));
      }
    },

    // Make sure the user has entered a reason when requesting access to master.
    validateRequest: function(evt) {
      if (this.masterAccessReason) {
        this.requestAccess();
      } else {
        alert(this.$t('message.masterRequest-validation-failed'));
        evt.preventDefault();
      }
    },

    // Submit request for access.
    requestAccess: function() {
      this.$nuxeo.operation('javascript.api_bulk_start_master_access')
        .input('docs:' + this.asset.uid)
        .params({
          'reason': this.masterAccessReason
        })
        .execute()
        .then(function(result) {
          if (result.entries) {
            this.asset = result.entries[0];
          } else {
            // TODO: Nuxeo is returning "undefined" as a nashorn error...
            console.log("WARNING: MasterRequest.requestAccess() isn't functioning correctly! Look at the result...")
          }
          // Workaround...
          this.showRequestButton = false;
          this.masterRequestPending = true;
          // End Workaround
          this.$toasted.success(this.$t('message.masterRequest-request-sent'), constants.TOASTED_DEFAULT_OPTIONS);
        }.bind(this))
        .catch(function(error) {
          this.$toasted.error(this.$t('message.masterRequest-request-failed'), constants.TOASTED_DEFAULT_OPTIONS);
          throw error;
        }.bind(this));
    },

    // Check the status of any pending master access request.
    handleRequestStatus: function() {
      if (this.asset && this.asset.contextParameters && this.asset.contextParameters.permissions) {
        var permissions = this.asset.contextParameters.permissions;
        // Assets with a pending master request have the permission "PENDING"...
        var isPending = permissions.indexOf('PENDING') > -1;
        if (isPending) {
          this.masterRequestPending = true;
        } else {
          this.masterRequestPending = false;
        }
        // Assets where master access has been granted have the permission "DOWNLOAD"
        // Note: the "PENDING" permission is removed by the workflow in this case.
        var accessGranted = permissions.indexOf('DOWNLOAD') > -1;
        if (accessGranted) {
          this.masterAccessGranted = true;
        } else {
          this.masterAccessGranted = false;
        }
        // Show the button to request access as appropriate.
        if (this.masterRequestPending == false && this.masterAccessGranted == false && this.isGuest == false) {
          this.showRequestButton = true;
        }
      }
    },

    // The master access request button is only enabled for authenticated users.
    // Note: this is used for filtering buttons. It is NOT related to security.
    testGuest() {
      this.$nuxeo.operation('login')
        .execute()
        .then(function(user) {
          if (user.username === "Guest") {
            this.isGuest = true;
          } else {
            this.isGuest = false;
          }
        }.bind(this))
        .catch(function(error) {
          // something went wrong
          throw error;
        });
    }
  } // End of methods

}
</script>

<style scoped>
button,
.message {
  margin-top: 10px;
}
</style>
