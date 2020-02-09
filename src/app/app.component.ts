import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent implements OnInit  {
  name = 'Folks';

  isIdle?: Boolean = false;
  maxInactivityTime?: any;
  timeRemaining?: any;
  activityIntervals: any =[];
  sessionIntervals: any =[];
  timeouts: any = [];
  showPopup?:Boolean = false;
  sessionExpired?: Boolean = false;
  remainingTimePopup?: any;

  ngOnInit() {
    this.activityIntervals = [];
    this.sessionIntervals = [];
    this.isIdle = false;
    this.showPopup = false;
    this.sessionExpired = false;


    //starting point to watch for inactivity
    this.maxInactivityTime = 60 * 1;
    this.activityWatcher(this.maxInactivityTime);
    //starting point to get user session token expires in time
    this.timeoutWatcher();
    
    
  }

  timeoutWatcher() {
    localStorage.setItem('expiresIn', '1581269100000');
    var expiresIn = localStorage.getItem('expiresIn');
    console.log('expires in String', new Date( Number(expiresIn)));
    console.log('remaining time',new Date( Number(expiresIn)).getTime()-new Date().getTime());
    //checking if expiresIn - current time is in negativity to check session already expired
    if((new Date( Number(expiresIn)).getTime()-new Date().getTime())> 0) {
      var timeoutStart = new Date(Number(expiresIn) - 60000).getTime() - new Date().getTime();
    console.log('timeoutstart', timeoutStart );

    //staring timeout for the session - one minute as buffer time for token refresh
    var expiresInTimer = setTimeout(() => {
      let _that = this;
      this.timeOutWarning.call(_that);
    }, timeoutStart);
    } else {
      this.showPopup = false;
      this.sessionExpired = true;
      console.log('session expired');
      this.clearActivityIntervals();
      this.clearAllSessionIntervals();
    }
    
  }

    timeOutWarning() {
    if (!this.isIdle) {
      console.log('not idle..request for token');
      this.clearAllSessionIntervals();
     // this.timeoutWatcher();    --to restart all session activity
    } else {
      this.showPopup = true;
      var timeoutIn = localStorage.getItem('expiresIn');
      var timeoutStart =
        new Date(Number(timeoutIn)).getTime() - new Date().getTime();
      console.log('here in timeout', timeoutStart);
      this.clearActivityIntervals();
      //starting timer for last one minute for user inactivity
      var a = new timer(() => {
        console.log('timedout');
        this.showPopup = false;
        this.sessionExpired = true;
        this.clearAllSessionIntervals();
      }, timeoutStart);
      //getting seconds left from the timer
     var timeleft = setInterval(() => {
        console.log('Time left: ' + a.getTimeLeft() / 1000 + 's');
        this.remainingTimePopup = Math.floor(a.getTimeLeft() / 1000) + 's';
      }, 1000);
      this.sessionIntervals.push(a);
      this.sessionIntervals.push(timeleft);
    }
  }

//clear all intervals related to session
  clearAllSessionIntervals() {
    this.sessionIntervals.forEach(clearInterval);
  }
  //clear all intervals for user activity
  clearActivityIntervals() {
    this.activityIntervals.forEach(clearInterval);
  }


  activityWatcher(params) {
  //The number of seconds that have passed
  //since the user was active.
  var secondsSinceLastActivity = 0;

  //Five minutes. 60 x 5 = 300 seconds.
  var maxInactivity = params;

  //Setup the setInterval method to run
  //every second. 1000 milliseconds = 1 second.
  var activityinterval = setInterval(() =>{
    secondsSinceLastActivity++;
    // console.log(
    //   secondsSinceLastActivity + ' seconds since the user was last active'
    // );
    //if the user has been inactive or idle for longer
    //then the seconds specified in maxInactivity
    if (secondsSinceLastActivity > maxInactivity) {
      console.log(
        'User has been inactive for more than ' + maxInactivity + ' seconds'
      );
      //Redirect them to your logout.php page.
      // location.href = 'logout.php';
      // this.idleSubject.next(true);
     this.isIdle = true;
    } else {
      this.isIdle = false;
    }
  }, 1000);
  this.activityIntervals.push(activityinterval);

  //The function that will be called whenever a user is active
  function activity() {
    //reset the secondsSinceLastActivity variable
    //back to 0
    secondsSinceLastActivity = 0;
  }

  //An array of DOM events that should be interpreted as
  //user activity.
  var activityEvents = ['mousedown', 'keydown'];

  //add these events to the document.
  //register the activity function as the listener parameter.
  activityEvents.forEach(function(eventName) {
    document.addEventListener(eventName, activity, true);
  });
}
}


function timer(callback, delay) {
  var id,
    started,
    remaining = delay,
    running;

  this.start = function() {
    running = true;
    started = new Date();
    id = setTimeout(callback, remaining);
  };

  this.pause = function() {
    running = false;
    clearTimeout(id);
    remaining -= +new Date() - started;
  };

  this.getTimeLeft = function() {
    if (running) {
      this.pause();
      this.start();
    }

    return remaining;
  };

  this.getStateRunning = function() {
    return running;
  };

  this.start();
}


