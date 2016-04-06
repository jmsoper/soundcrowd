var React = require('react'),
    IndexItem = require('./index_item'),
    RecordingStore = require('../stores/recordings.js'),
    SessionStore = require('../stores/session_store'),
    UserStore = require('../stores/user_store'),
    ApiUtil = require('../util/api_util.js'),
    HomePlaylists = require('./home-playlists'),
    HomeRecordings = require('./home-recordings'),
    HomeFollowing = require('./home-following'),
    HomeOverview = require('./home-overview');

function _getAllRecordings() {
  return RecordingStore.all();
}

var Index = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },
  getInitialState: function(){
    return {
      recordings: _getAllRecordings(), selected: "overview", user: SessionStore.currentUser()
    };
  },
  componentDidMount: function () {
    this.recordingListener = RecordingStore.addListener(this._onChange);
    this.sessionListener = RecordingStore.addListener(this._onChange);
    ApiUtil.fetchCurrentUser();
    ApiUtil.fetchUsers();
    ApiUtil.fetchRecordings();
  },
  componentWillUnmount: function () {
    this.recordingListener.remove();
    this.sessionListener.remove();

  },
  _onChange: function () {
    var current_user = SessionStore.currentUser().id;
    if (current_user){
    var own_recordings = UserStore.find(current_user).recordings;
    this.setState({own_recordings: own_recordings});
    }
    this.setState({recordings: _getAllRecordings()});
    this.setState({user: current_user});

  },
  handleItemClick: function (recording) {
    this.context.router.push("recordings/" + recording.id);
  },
  handleNavFollowingClick: function () {
    this.setState({selected: "following"});
  },
  handleNavOverviewClick: function () {
    this.setState({selected: "overview"});
  },
  handleNavRecordingsClick: function () {
    this.setState({selected: "recordings"});
  },
  handleNavPlaylistsClick: function () {
    this.setState({selected: "playlists"});
  },
  generateFollowingButton: function () {
    var button;
    if (this.state.selected == "following"){
      button = <li className="collections-selected"><a onClick={this.handleNavFollowingClick}>Following</a></li>;
    } else {
      button = <li><a onClick={this.handleNavFollowingClick}>Following</a></li>;
    }
    return button;
  },
  generateOverviewButton: function () {
    var button;
    if (this.state.selected == "overview"){
      button = <li className="collections-selected"><a onClick={this.handleNavOverviewClick}>Overview</a></li>;
    } else {
      button = <li><a onClick={this.handleNavOverviewClick}>Overview</a></li>;
    }
    return button;
  },
  generateRecordingsButton: function () {
    var button;
    if (this.state.selected == "recordings"){
      button = <li className="collections-selected"><a onClick={this.handleNavRecordingsClick}>Recordings</a></li>;
    } else {
      button = <li><a onClick={this.handleNavRecordingsClick}>Recordings</a></li>;
    }
    return button;
  },
  generatePlaylistsButton: function () {
    var button;
    if (this.state.selected == "playlists"){
      button = <li className="collections-selected"><a onClick ={this.handleNavPlaylistsClick}>Playlists</a></li>;
    } else {
      button = <li><a onClick ={this.handleNavPlaylistsClick}>Playlists</a></li>;
    }
    return button;
  },
  render: function(){
    var handleItemClick = this.handleItemClick;
    var content;
    switch (this.state.selected) {
      case "overview":
        content = <HomeOverview
                    clickfunction = {this.handleItemClick}
                    ownRecordings = {this.state.own_recordings}
                    recordings = {this.state.recordings}
                    user = {this.state.user}/>;
        break;
      case "recordings":
        content = <HomeRecordings
                    clickfunction = {this.handleItemClick}
                    ownRecordings = {this.state.own_recordings}/>;
        break;
      case "playlists":
        content = <HomePlaylists
                    clickfunction = {this.handleItemClick}/>;
        break;
      case "following":
        content = <HomeFollowing
                    clickfunction = {this.handleItemClick}
                    following = {this.state.user.followed_users}/>;
        break;
      default:
        content = <HomeOverview
                    clickfunction = {this.handleItemClick}
                    ownRecordings = {this.state.own_recordings}
                    recordings = {this.state.recordings}
                    user = {this.state.user}/>;
        break;
    }

    return (
      <section className="content collection-nav" id="collections-overview">
        <ul className = "collection-nav-list">
          {this.generateFollowingButton()}
          {this.generatePlaylistsButton()}
          {this.generateRecordingsButton()}
          {this.generateOverviewButton()}
        </ul>
        {content}
      </section>
    );
  }
});

module.exports = Index;
