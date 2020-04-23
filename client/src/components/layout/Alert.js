import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

// Alerts being destructured right now
// otherwise props should go in there.
// props let this component acess property in combined/root reducers file.

// REQUIREMENT
// Render the alerts to the UI
// Making sure something is in the array > length > 0
// Making sure values in array !== null
// If all left hands operation true -> you can return your desired outcome
const Alert = ({ alerts }) =>
  alerts !== null &&
  alerts.length > 0 &&
  alerts.map(alert => (
    <div key={alert.id} className={` alert alert-${alert.alertType}`}>
      {alert.msg}
    </div>
  ));

Alert.propTypes = {
  alerts: PropTypes.array.isRequired
};

// FETCHING state from redux into this component
// mapping redux state to a prop in this component SO this component has access to that state
// In this case an array of alerts

// alerts below = call it whatever we want.
// alerts can be destructured right uptop at passed in argument.
// alert = we caled it at import alert in combined / rootbreducers folder.


const mapStateToProps = state => ({
  alerts: state.alert
});

export default connect(mapStateToProps)(Alert);
