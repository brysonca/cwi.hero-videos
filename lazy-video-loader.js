/* ES6
* https://medium.com/dailyjs/lazy-loading-video-based-on-connection-speed-e2de086f9095
* https://gist.github.com/benjamingrobertson/00c5b47eaf5786da0759b63d78dfde9e#file-lazy-video-loader-js
*
* Moved function call to cwi.hero-video.js to run inside drupal
* remove Mobile window removal
* added processed-video class to body
*/

(function ($) {
  Drupal.behaviors.slideshow = {
    attach: function(context, settings) {

      class LazyVideoLoader {
        constructor() {
          this.videos = [].slice.call(document.querySelectorAll('.hero-slide-wrapper.video .js-video-loader')); //CWI
          // Abort when:
          //  - The browser does not support Promises.
          //  - There no videos.
          //  - If the user prefers reduced motion.
          //  - Device is mobile.
          if (
            typeof Promise === 'undefined' ||
            !this.videos ||
            window.matchMedia('(prefers-reduced-motion)').matches 
            //|| //CWI
            //window.innerWidth < 992 //CWI
          ) {
            return;
          }

          this.videos.forEach(this.loadVideo.bind(this));
        }

        loadVideo(video) {

          this.setSource(video);

          video.load();

          this.checkLoadTime(video);
        }

        /**
         * Find the children of the video that are <source> tags.
         * Set the src attribute for each <source> based on the
         * data-src attribute.
         *
         * @param {object} video The video element.
         * @returns {void}
         */
        setSource(video) {
          const children = [].slice.call(video.children);
          children.forEach((child) => {
            if (
              child.tagName === 'SOURCE' &&
              typeof child.getAttribute('data-src') !== 'undefined'
            ) {
              child.setAttribute('src', child.getAttribute('data-src'));
            }
          });
        }

        /**
         * Checks if the video will be able to play through before
         * a predetermined time has passed.
         * @param {object} video The video element.
         * @returns {void}
         */
        checkLoadTime(video) {
          // Create a promise that resolves when the
          // video.canplaythrough event triggers.
          const videoLoad = new Promise((resolve) => {
            video.addEventListener('canplaythrough', () => {
              resolve('can play');
            });
          });

          // Create a promise that resolves after a
          // predetermined time (2sec)
          const videoTimeout = new Promise((resolve) => {
            setTimeout(() => {
              resolve('The video timed out.');
            }, 2000);
          });

          // Race the promises to see which one resolves first.
          Promise.race([videoLoad, videoTimeout]).then((data) => {
            if (data === 'can play') {
              video.play();
              setPlayPauseButton();
              setPlayPauseText();
              setTimeout(() => {
                video.classList.add('video-loaded');
              }, 500);
            }
            else {
              this.cancelLoad(video);
            }
          });
        }

        /**
         * Cancel the video loading by removing all
         * <source> tags and then triggering video.load().
         *
         * @param {object} video The video element.
         * @returns {void}
         */
        cancelLoad(video) {
          const children = [].slice.call(video.children);
          children.forEach((child) => {
            if (
              child.tagName === 'SOURCE' &&
              typeof child.dataset.src !== 'undefined'
            ) {
              child.parentNode.removeChild(child);
            }
          });

          // reload the video without <source> tags so it
          // stops downloading.
          video.load();
        }
      }

      function setPlayPauseText() {

        setTimeout(function(){

          var activeVideoWrapper = document.querySelectorAll('.hero-slide-wrapper video');

            // Define Play Button and video elements 
            var playButton = document.getElementById("play-pause");
            var playButtonText = document.getElementById("play-pause-text"); 
            var video = activeVideoWrapper[0];
            
            // Set button text
            if (typeof video !== 'undefined') {
                if (video.paused == true) { 
                  playButtonText.innerHTML = "Pause Hero Video";
                  document.querySelector('#hero-video-controls').classList.remove('playing');
                  document.querySelector('#play-pause').classList.remove('playing');
                }
                else { 
                  playButtonText.innerHTML = "Pause Hero Video";
                  document.querySelector('#hero-video-controls').classList.add('playing'); //CWI;
                  document.querySelector('#play-pause').classList.add('playing'); //CWI;
                }
            }

          // Tab focus
          var mousedown = false;
          document.querySelector('#play-pause').onmousedown = function () {
            mousedown = true;
          };
          document.querySelector('#play-pause').onfocusin = function () {
            if(!mousedown) {
              this.classList.add("tabfocus");
            }
            mousedown = false;
          };
          document.querySelector('#play-pause').onfocusout = function() {
            this.classList.remove('tabfocus');
          };
        }, 500);
       }

      // Set Play Button and Video + Listener Function
      function setPlayPauseButton() {
    
        var activeVideoWrapper = document.getElementsByClassName('hero-slide-wrapper video');
        var activeVideoWrapperVideo = document.getElementsByTagName("video");
        
        // Play button listener function
        setTimeout(function(){

            let controls = document.createElement('div');
            controls.id = 'hero-video-controls';
            controls.class = 'playing';
            controls.innerHTML = "<a href='/' id='play-pause' tabindex='0' class='playing'><span class='element-invisible off_screen' id='play-pause-text'>Pause Hero Video</span></a>";
            document.querySelector('.hero-slide-wrapper.video').appendChild(controls);

            var playButton = document.getElementById("play-pause");
            var playButtonText = document.getElementById("play-pause-text");
            var video = activeVideoWrapperVideo[0];

            // Event listener for the play/pause button
            playButton.onclick = function(e) {
              
              if (video.paused == true) {
                // Play the video
                video.play();
                // Update the button text to 'Pause Video'
                playButtonText.innerHTML = "Pause Hero Video";
                document.querySelector('#hero-video-controls').classList.add('playing');
                document.querySelector('#play-pause').classList.add('playing');
              } else {
                // Pause the video
                video.pause();
                // Update the button text to 'Play Video'
                playButtonText.innerHTML = "Play Hero Video";
                document.querySelector('#hero-video-controls').classList.remove('playing');
                document.querySelector('#play-pause').classList.remove('playing');
              }
              // Prevent default click behavior on Play/Pause button click
              e.preventDefault();
            };
            document.body.classList.add('processed-video'); //CWI
        }, 150);
      }
      
      //init
      new LazyVideoLoader();
    }
  };
})(jQuery);