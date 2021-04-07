(function ($) {
  /* ===============================================================
  Mobile Menu Feature
=============================================================== */
  class MobileMenu {
    constructor() {
      this.menu = document.querySelector(".site-header__menu");
      this.openButton = document.querySelector(".site-header__menu-trigger");
      this.events();
    }

    events() {
      this.openButton.addEventListener("click", () => this.openMenu());
    }

    openMenu() {
      this.openButton.classList.toggle("fa-bars");
      this.openButton.classList.toggle("fa-window-close");
      this.menu.classList.toggle("site-header__menu--active");
    }
  }

  new MobileMenu();

  /* ===============================================================
  Hero Slider / Homepage Slideshow
=============================================================== */
  class HeroSlider {
    constructor() {
      if (document.querySelector(".hero-slider")) {
        // count how many slides there are
        const dotCount = document.querySelectorAll(".hero-slider__slide")
          .length;

        // Generate the HTML for the navigation dots
        let dotHTML = "";
        for (let i = 0; i < dotCount; i++) {
          dotHTML += `<button class="slider__bullet glide__bullet" data-glide-dir="=${i}"></button>`;
        }

        // Add the dots HTML to the DOM
        document
          .querySelector(".glide__bullets")
          .insertAdjacentHTML("beforeend", dotHTML);

        // Actually initialize the glide / slider script
        var glide = new Glide(".hero-slider", {
          type: "carousel",
          perView: 1,
          autoplay: 3000,
        });

        glide.mount();
      }
    }
  }

  new HeroSlider();

  /* ===============================================================
  Google Map / Campus Map
=============================================================== */
  class GoogleMap {
    constructor() {
      document.querySelectorAll(".acf-map").forEach((el) => {
        this.new_map(el);
      });
    }

    new_map($el) {
      var $markers = $el.querySelectorAll(".marker");

      var args = {
        zoom: 16,
        center: new google.maps.LatLng(0, 0),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      };

      var map = new google.maps.Map($el, args);
      map.markers = [];
      var that = this;

      // add markers
      $markers.forEach(function (x) {
        that.add_marker(x, map);
      });

      // center map
      this.center_map(map);
    } // end new_map

    add_marker($marker, map) {
      var latlng = new google.maps.LatLng(
        $marker.getAttribute("data-lat"),
        $marker.getAttribute("data-lng")
      );

      var marker = new google.maps.Marker({
        position: latlng,
        map: map,
      });

      map.markers.push(marker);

      // if marker contains HTML, add it to an infoWindow
      if ($marker.innerHTML) {
        // create info window
        var infowindow = new google.maps.InfoWindow({
          content: $marker.innerHTML,
        });

        // show info window when marker is clicked
        google.maps.event.addListener(marker, "click", function () {
          infowindow.open(map, marker);
        });
      }
    } // end add_marker

    center_map(map) {
      var bounds = new google.maps.LatLngBounds();

      // loop through all markers and create bounds
      map.markers.forEach(function (marker) {
        var latlng = new google.maps.LatLng(
          marker.position.lat(),
          marker.position.lng()
        );

        bounds.extend(latlng);
      });

      // only 1 marker?
      if (map.markers.length == 1) {
        // set center of map
        map.setCenter(bounds.getCenter());
        map.setZoom(16);
      } else {
        // fit to bounds
        map.fitBounds(bounds);
      }
    } // end center_map
  }

  new GoogleMap();

  /* ===============================================================
  Search / Live Overlay Results
=============================================================== */
  class Search {
    // 1. describe and create/initiate our object
    constructor() {
      this.addSearchHTML();
      this.resultsDiv = $("#search-overlay__results");
      this.openButton = $(".js-search-trigger");
      this.closeButton = $(".search-overlay__close");
      this.searchOverlay = $(".search-overlay");
      this.searchField = $("#search-term");
      this.events();
      this.isOverlayOpen = false;
      this.isSpinnerVisible = false;
      this.previousValue;
      this.typingTimer;
    }

    // 2. events
    events() {
      this.openButton.on("click", this.openOverlay.bind(this));
      this.closeButton.on("click", this.closeOverlay.bind(this));
      $(document).on("keydown", this.keyPressDispatcher.bind(this));
      this.searchField.on("keyup", this.typingLogic.bind(this));
    }

    // 3. methods (function, action...)
    typingLogic() {
      if (this.searchField.val() != this.previousValue) {
        clearTimeout(this.typingTimer);

        if (this.searchField.val()) {
          if (!this.isSpinnerVisible) {
            this.resultsDiv.html('<div class="spinner-loader"></div>');
            this.isSpinnerVisible = true;
          }
          this.typingTimer = setTimeout(this.getResults.bind(this), 750);
        } else {
          this.resultsDiv.html("");
          this.isSpinnerVisible = false;
        }
      }

      this.previousValue = this.searchField.val();
    }

    getResults() {
      $.getJSON(
        universityData.root_url +
          "/wp-json/university/v1/search?term=" +
          this.searchField.val(),
        (results) => {
          this.resultsDiv.html(`
        <div class="row">
          <div class="one-third">
            <h2 class="search-overlay__section-title">General Information</h2>
            ${
              results.generalInfo.length
                ? '<ul class="link-list min-list">'
                : "<p>No general information matches that search.</p>"
            }
              ${results.generalInfo
                .map(
                  (item) =>
                    `<li><a href="${item.permalink}">${item.title}</a> ${
                      item.postType == "post" ? `by ${item.authorName}` : ""
                    }</li>`
                )
                .join("")}
            ${results.generalInfo.length ? "</ul>" : ""}
          </div>
          <div class="one-third">
            <h2 class="search-overlay__section-title">Programs</h2>
            ${
              results.programs.length
                ? '<ul class="link-list min-list">'
                : `<p>No programs match that search. <a href="${universityData.root_url}/programs">View all programs</a></p>`
            }
              ${results.programs
                .map(
                  (item) =>
                    `<li><a href="${item.permalink}">${item.title}</a></li>`
                )
                .join("")}
            ${results.programs.length ? "</ul>" : ""}

            <h2 class="search-overlay__section-title">Professors</h2>
            ${
              results.professors.length
                ? '<ul class="professor-cards">'
                : `<p>No professors match that search.</p>`
            }
              ${results.professors
                .map(
                  (item) => `
                <li class="professor-card__list-item">
                  <a class="professor-card" href="${item.permalink}">
                    <img class="professor-card__image" src="${item.image}">
                    <span class="professor-card__name">${item.title}</span>
                  </a>
                </li>
              `
                )
                .join("")}
            ${results.professors.length ? "</ul>" : ""}

          </div>
          <div class="one-third">
            <h2 class="search-overlay__section-title">Campuses</h2>
            ${
              results.campuses.length
                ? '<ul class="link-list min-list">'
                : `<p>No campuses match that search. <a href="${universityData.root_url}/campuses">View all campuses</a></p>`
            }
              ${results.campuses
                .map(
                  (item) =>
                    `<li><a href="${item.permalink}">${item.title}</a></li>`
                )
                .join("")}
            ${results.campuses.length ? "</ul>" : ""}

            <h2 class="search-overlay__section-title">Events</h2>
            ${
              results.events.length
                ? ""
                : `<p>No events match that search. <a href="${universityData.root_url}/events">View all events</a></p>`
            }
              ${results.events
                .map(
                  (item) => `
                <div class="event-summary">
                  <a class="event-summary__date t-center" href="${item.permalink}">
                    <span class="event-summary__month">${item.month}</span>
                    <span class="event-summary__day">${item.day}</span>  
                  </a>
                  <div class="event-summary__content">
                    <h5 class="event-summary__title headline headline--tiny"><a href="${item.permalink}">${item.title}</a></h5>
                    <p>${item.description} <a href="${item.permalink}" class="nu gray">Learn more</a></p>
                  </div>
                </div>
              `
                )
                .join("")}

          </div>
        </div>
      `);
          this.isSpinnerVisible = false;
        }
      );
    }

    keyPressDispatcher(e) {
      if (
        e.keyCode == 83 &&
        !this.isOverlayOpen &&
        !$("input, textarea").is(":focus")
      ) {
        this.openOverlay();
      }

      if (e.keyCode == 27 && this.isOverlayOpen) {
        this.closeOverlay();
      }
    }

    openOverlay(e) {
      e.preventDefault();
      this.searchOverlay.addClass("search-overlay--active");
      $("body").addClass("body-no-scroll");
      this.searchField.val("");
      setTimeout(() => this.searchField.focus(), 301);
      console.log("our open method just ran!");
      this.isOverlayOpen = true;
    }

    closeOverlay() {
      this.searchOverlay.removeClass("search-overlay--active");
      $("body").removeClass("body-no-scroll");
      console.log("our close method just ran!");
      this.isOverlayOpen = false;
    }

    addSearchHTML() {
      $("body").append(`
      <div class="search-overlay">
        <div class="search-overlay__top">
          <div class="container">
            <i class="fa fa-search search-overlay__icon" aria-hidden="true"></i>
            <input type="text" class="search-term" placeholder="What are you looking for?" id="search-term">
            <i class="fa fa-window-close search-overlay__close" aria-hidden="true"></i>
          </div>
        </div>
        
        <div class="container">
          <div id="search-overlay__results"></div>
        </div>

      </div>
    `);
    }
  }

  new Search();

  /* ===============================================================
  My Notes Feature
=============================================================== */
  class MyNotes {
    constructor() {
      this.events();
    }

    events() {
      $("#my-notes").on("click", ".delete-note", this.deleteNote);
      $("#my-notes").on("click", ".edit-note", this.editNote.bind(this));
      $("#my-notes").on("click", ".update-note", this.updateNote.bind(this));
      $(".submit-note").on("click", this.createNote.bind(this));
    }

    // Methods will go here
    editNote(e) {
      var thisNote = $(e.target).parents("li");
      if (thisNote.data("state") == "editable") {
        this.makeNoteReadOnly(thisNote);
      } else {
        this.makeNoteEditable(thisNote);
      }
    }

    makeNoteEditable(thisNote) {
      thisNote
        .find(".edit-note")
        .html('<i class="fa fa-times" aria-hidden="true"></i> Cancel');
      thisNote
        .find(".note-title-field, .note-body-field")
        .removeAttr("readonly")
        .addClass("note-active-field");
      thisNote.find(".update-note").addClass("update-note--visible");
      thisNote.data("state", "editable");
    }

    makeNoteReadOnly(thisNote) {
      thisNote
        .find(".edit-note")
        .html('<i class="fa fa-pencil" aria-hidden="true"></i> Edit');
      thisNote
        .find(".note-title-field, .note-body-field")
        .attr("readonly", "readonly")
        .removeClass("note-active-field");
      thisNote.find(".update-note").removeClass("update-note--visible");
      thisNote.data("state", "cancel");
    }

    deleteNote(e) {
      var thisNote = $(e.target).parents("li");

      $.ajax({
        beforeSend: (xhr) => {
          xhr.setRequestHeader("X-WP-Nonce", universityData.nonce);
        },
        url:
          universityData.root_url +
          "/wp-json/wp/v2/note/" +
          thisNote.data("id"),
        type: "DELETE",
        success: (response) => {
          thisNote.slideUp();
          console.log("Congrats");
          console.log(response);
          if (response.userNoteCount < 5) {
            $(".note-limit-message").removeClass("active");
          }
        },
        error: (response) => {
          console.log("Sorry");
          console.log(response);
        },
      });
    }

    updateNote(e) {
      var thisNote = $(e.target).parents("li");

      var ourUpdatedPost = {
        title: thisNote.find(".note-title-field").val(),
        content: thisNote.find(".note-body-field").val(),
      };

      $.ajax({
        beforeSend: (xhr) => {
          xhr.setRequestHeader("X-WP-Nonce", universityData.nonce);
        },
        url:
          universityData.root_url +
          "/wp-json/wp/v2/note/" +
          thisNote.data("id"),
        type: "POST",
        data: ourUpdatedPost,
        success: (response) => {
          this.makeNoteReadOnly(thisNote);
          console.log("Congrats");
          console.log(response);
        },
        error: (response) => {
          console.log("Sorry");
          console.log(response);
        },
      });
    }

    createNote(e) {
      var ourNewPost = {
        title: $(".new-note-title").val(),
        content: $(".new-note-body").val(),
        status: "publish",
      };

      $.ajax({
        beforeSend: (xhr) => {
          xhr.setRequestHeader("X-WP-Nonce", universityData.nonce);
        },
        url: universityData.root_url + "/wp-json/wp/v2/note/",
        type: "POST",
        data: ourNewPost,
        success: (response) => {
          $(".new-note-title, .new-note-body").val("");
          $(`
          <li data-id="${response.id}">
            <input readonly class="note-title-field" value="${response.title.raw}">
            <span class="edit-note"><i class="fa fa-pencil" aria-hidden="true"></i> Edit</span>
            <span class="delete-note"><i class="fa fa-trash-o" aria-hidden="true"></i> Delete</span>
            <textarea readonly class="note-body-field">${response.content.raw}</textarea>
            <span class="update-note btn btn--blue btn--small"><i class="fa fa-arrow-right" aria-hidden="true"></i> Save</span>
          </li>
          `)
            .prependTo("#my-notes")
            .hide()
            .slideDown();

          console.log("Congrats");
          console.log(response);
        },
        error: (response) => {
          if (response.responseText == "You have reached your note limit.") {
            $(".note-limit-message").addClass("active");
          }
          console.log("Sorry");
          console.log(response);
        },
      });
    }
  }

  new MyNotes();

  /* ===============================================================
  Like a Professor Feature
=============================================================== */
  class Like {
    constructor() {
      this.events();
    }

    events() {
      $(".like-box").on("click", this.ourClickDispatcher.bind(this));
    }

    // methods
    ourClickDispatcher(e) {
      var currentLikeBox = $(e.target).closest(".like-box");

      if (currentLikeBox.attr("data-exists") == "yes") {
        this.deleteLike(currentLikeBox);
      } else {
        this.createLike(currentLikeBox);
      }
    }

    createLike(currentLikeBox) {
      $.ajax({
        beforeSend: (xhr) => {
          xhr.setRequestHeader("X-WP-Nonce", universityData.nonce);
        },
        url: universityData.root_url + "/wp-json/university/v1/manageLike",
        type: "POST",
        data: { professorId: currentLikeBox.data("professor") },
        success: (response) => {
          currentLikeBox.attr("data-exists", "yes");
          var likeCount = parseInt(
            currentLikeBox.find(".like-count").html(),
            10
          );
          likeCount++;
          currentLikeBox.find(".like-count").html(likeCount);
          currentLikeBox.attr("data-like", response);
          console.log(response);
        },
        error: (response) => {
          console.log(response);
        },
      });
    }

    deleteLike(currentLikeBox) {
      $.ajax({
        beforeSend: (xhr) => {
          xhr.setRequestHeader("X-WP-Nonce", universityData.nonce);
        },
        url: universityData.root_url + "/wp-json/university/v1/manageLike",
        data: { like: currentLikeBox.attr("data-like") },
        type: "DELETE",
        success: (response) => {
          currentLikeBox.attr("data-exists", "no");
          var likeCount = parseInt(
            currentLikeBox.find(".like-count").html(),
            10
          );
          likeCount--;
          currentLikeBox.find(".like-count").html(likeCount);
          currentLikeBox.attr("data-like", "");
          console.log(response);
        },
        error: (response) => {
          console.log(response);
        },
      });
    }
  }

  new Like();
})(jQuery);
