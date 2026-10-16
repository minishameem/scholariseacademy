/* =====================================================================
   HOME: "The Scholarise Online Experience" – PHOTOS
   ---------------------------------------------------------------------
   This is the only place you need to edit to add the real photos.

   HOW TO ADD A PHOTO
   1. Put the photo in the folder  assets/images/online/
      (a .jpg or .webp around 1200px wide is enough; the big
      mainClassroom photo can be 1600px wide).
   2. Write its file name in `src` below, e.g.
        src: 'assets/images/online/main-classroom.jpg'
   3. Check the `alt` text describes what is really in the photo.
   4. Optional `position` moves the crop, e.g. '30% 50%' keeps more of the
      left side in view ('50% 50%' is the centre).
   Leave `src` empty ('') to keep the designed placeholder.

   The frame keeps its size and shape, so the page layout does not move
   when a photo is added. Photos are cropped to fill the frame, so keep
   the important part of the picture near the middle.

   Frame shapes (width : height):
     mainClassroom 5:4 · learnerSharing 1:1 · learnerNotebook 4:5
     step photos 4:3 · learnerParticipating 16:11
     guidedPractice 3:2 · instructorTeaching 4:3
   ===================================================================== */

window.SCHOLARISE_ONLINE_PHOTOS = {

  /* Part A: opening collage */
  mainClassroom:        { src: 'assets/images/online/main-classroom.webp', position: '45% 50%',
                          alt: 'A learner with headphones at home, joining a live online class on a laptop with the instructor and classmates on screen' },
  learnerSharing:       { src: 'assets/images/online/learner-sharing.webp', position: '18% 50%',
                          alt: 'A learner speaking and sharing an idea while others listen' },
  learnerNotebook:      { src: 'assets/images/online/learner-notebook.webp', position: '50% 62%',
                          alt: 'A learner concentrating while writing answers on a worksheet' },

  /* Part B: How Our Online Classes Work (steps 1 to 4) */
  stepFindCourse:       { src: 'assets/images/online/step-find-course.webp', position: '50% 55%',
                          alt: 'A learner looking at English courses on the Scholarise website' },
  stepJoinClass:        { src: 'assets/images/online/step-join-class.webp', position: '50% 50%',
                          alt: 'A learner at home in a live online class, with the instructor and classmates on the laptop screen' },
  stepTakePart:         { src: 'assets/images/online/step-take-part.webp', position: '45% 50%',
                          alt: 'A learner raising her hand to answer the instructor during an online class' },
  learningProgress:     { src: 'assets/images/online/learning-progress.webp', position: '45% 50%',
                          alt: 'A learner going through her marked work while the instructor gives feedback online' },

  /* Part C: A Glimpse Inside the Class */
  learnerParticipating: { src: 'assets/images/online/learner-participating.webp', position: '40% 50%',
                          alt: 'A learner with a headset speaking to the instructor during a live online class' },
  guidedPractice:       { src: 'assets/images/online/guided-practice.webp', position: '45% 50%',
                          alt: 'A learner completing a worksheet while the instructor shows the activity on screen' },
  instructorTeaching:   { src: 'assets/images/online/instructor-teaching.webp', position: '50% 50%',
                          alt: 'The instructor using picture cards to guide a learner in a live online class' }
};

/* ---- no need to edit below this line ---- */
(function () {
  'use strict';
  var photos = window.SCHOLARISE_ONLINE_PHOTOS || {};
  var frames = document.querySelectorAll('[data-ox-slot]');
  Array.prototype.forEach.call(frames, function (frame) {
    var p = photos[frame.getAttribute('data-ox-slot')];
    if (!p || typeof p.src !== 'string' || !p.src.trim()) return;
    var img = new Image();
    img.decoding = 'async';
    img.loading = frame.getAttribute('data-ox-slot') === 'mainClassroom' ? 'eager' : 'lazy';
    img.alt = p.alt || '';
    img.draggable = false; // photos cannot be dragged off the page
    if (typeof p.position === 'string' && p.position.trim()) img.style.objectPosition = p.position.trim();
    img.addEventListener('load', function () {
      var ph = frame.querySelector('.ox-ph');
      if (ph) ph.remove();
    }, { once: true });
    // if the file is missing, the placeholder simply stays
    img.addEventListener('error', function () { img.remove(); }, { once: true });
    img.src = p.src.trim();
    frame.appendChild(img);
  });
})();
