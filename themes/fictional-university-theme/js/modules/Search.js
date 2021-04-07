import $ from 'jquery';

class Search{
    //1. describe object
    constructor(){
        this.addSearchHTML();
        this.openButton = $('.js-search-trigger');
        this.closeButton = $('.search-overlay__close');
        this.serachOverlay = $('.search-overlay');
        this.searchField = $('#search-term');
        this.resultsDiv = $('#serach-overlay__results');
        this.events();
        this.isOverlayOpen = false;
        this.isSpinnerVisible = false;
        this.previousValue;
        this.typingTimer;
        
    }
    //2. events
    events(){
        this.openButton.on('click', this.openOverlay.bind(this));
        this.closeButton.on('click', this.closeOverlay.bind(this));
        $(document).on('keydown', this.keyPressDispatecher.bind(this));
        this.searchField.on('keyup', this.typingLogic.bind(this));
    }
    //3. methods (functions, actions)
    openOverlay(){
        this.serachOverlay.addClass('search-overlay--active');
        $('body').addClass('body-no-scroll');
        this.searchField.val('');
        setTimeout(() => this.searchField.focus(), 301);
        this.isOverlayOpen = true;
        return false;//brak wyswietlania a href do linku podstorny
    }
    closeOverlay(){
        this.serachOverlay.removeClass('search-overlay--active');
        $('body').removeClass('body-no-scroll');
        this.isOverlayOpen = false;
    }
    keyPressDispatecher(e){
        if(e.keyCode == 83 && !this.isOverlayOpen && !$('input, textarea').is(':focus')){
            this.openOverlay();
        }
        if(e.keyCode == 27 && this.isOverlayOpen){
            this.closeOverlay();
        }
    }
    typingLogic(){
        if(this.searchField.val() !=  this.previousValue){
            clearTimeout(this.typingTimer);

            if(this.searchField.val()){
                if(!this.isSpinnerVisible){
                    this.resultsDiv.html('<div class="spinner-loader"></div>');
                    this.isSpinnerVisible = true;
                }
                this.typingTimer = setTimeout(this.getResults.bind(this), 750);
            }else{
                this.resultsDiv.html('');
                this.isSpinnerVisible = false;
            }
        }
        
        this.previousValue = this.searchField.val();
    }
    getResults(){
        $.getJSON(universityData.root_url + '/wp-json/university/v1/search?term=' + this.searchField.val(), results =>{
            this.resultsDiv.html(`
            <div class="row">
                <div class="one-third">
                    <h2 class="search-overlay__section-title">General information</h2>
                    ${results.generalInfo.length ? `<ul class="link-list min-list">` : `<p>Nothing found</p>`}
                    ${results.generalInfo.map(item => `<li><a href="${item.permalink}">${item.title}</a> ${item.postType == 'post' ? `by ${item.authorName}` : ''}</li>`).join('')}   
                    ${results.generalInfo ? `</ul>` : ``} 
                </div>
                <div class="one-third">
                    
                <h2 class="search-overlay__section-title">Programs</h2>
                    ${results.programs.length ? `<ul class="link-list min-list">` : `<p>No programs found <a href="${universityData.root_url}/programs">Zobacz wszystkie programy</a></p>`}
                    ${results.programs.map(item => `<li><a href="${item.permalink}">${item.title}</a></li>`).join('')}   
                    ${results.programs ? `</ul>` : ``} 
                    
                <h2 class="search-overlay__section-title">Professors</h2>
                    ${results.professors.length ? `<ul class="professor-cards  ">` : `<p>No professors found</p>`}
                    ${results.professors.map(item => `
                    <li class="professor-card__list-item">
                    <a class="professor-card" href="${item.permalink}">
                      <img class="professor-card__image" src="${item.image}" alt="">
                      <span class="professor-card__name"> ${item.title}</span>
                    </a>
                  </li>`).join('')}   
                    ${results.professors ? `</ul>` : ``} 
                </div>

                <div class="one-third">
                    <h2 class="search-overlay__section-title">Campuses</h2>
                    ${results.campuses.length ? `<ul class="link-list min-list">` : `<p>No campuses <a href="${universityData.root_url}/campuses">View all campuses</p>`}
                    ${results.campuses.map(item => `<li><a href="${item.permalink}">${item.title}</a></li>`).join('')}   
                    ${results.campuses ? `</ul>` : ``} 

                    <h2 class="search-overlay__section-title">Events</h2>
                    ${results.events.length ? `` : `<p>No events <a href="${universityData.root_url}/events">View all events</p>`}
                    ${results.events.map(item =>`
                    <div class="event-summary">
                    <a class="event-summary__date t-center" href="${item.permalink}">
                      <span class="event-summary__month">${item.month}</span>
                      <span class="event-summary__day">${item.day}</span>  
                    </a>
                    <div class="event-summary__content">
                      <h5 class="event-summary__title headline headline--tiny">
                      <a href="${item.permalink}">${item.title}</a></h5>
                      <p>${item.description} <a href="${item.permalink} " class="nu gray">Learn more</a></p>
                    </div>
                    </div>
                    `).join('')}   

                </div>
            </div>
            `);
        });
        
        
        
        // $.when(
        //     $.getJSON(universityData.root_url + '/wp-json/wp/v2/posts?search=' + this.searchField.val()), 
        //     $.getJSON(universityData.root_url + '/wp-json/wp/v2/pages?search=' + this.searchField.val())
        //     ).then((posts, pages)=>{
        //     let combineResults = posts[0].concat(pages[0]);
        //     this.resultsDiv.html(`
        //     <h2 class="search-overlay__section-title">General Information</h2>
        //     ${combineResults.length ? `<ul class="link-list min-list">` : `<p>Nothing found</p>`}
        //     ${combineResults.map(item => `<li><a href="${item.link}">${item.title.rendered}</a>
        //      ${item.type == 'post' ? `by ${item.authorName}` : ''}</li>`).join('')}   
        //     ${combineResults.length ? `</ul>` : ``} 
        //    `);
        //     this.isSpinnerVisible = false;
        // }, ()=>{
        //     this.resultsDiv.html('<p>Unexpected error, plese try again.</p>');
        // });
        
        
        // $.getJSON(universityData.root_url + '/wp-json/wp/v2/posts?search=' + this.searchField.val(), posts => {
        //     $.getJSON(universityData.root_url + '/wp-json/wp/v2/pages?search=' + this.searchField.val(), pages=>{
        //         let combineResults = posts.concat(pages);
        //         this.resultsDiv.html(`
        //         <h2 class="search-overlay__section-title">General Information</h2>
        //         ${combineResults.length ? `<ul class="link-list min-list">` : `<p>Nothing found</p>`}
        //         ${combineResults.map(item => `<li><a href="${item.link}">${item.title.rendered}</a></li>`).join('')}
        //         ${combineResults.length ? `</ul>` : ``} 
        //         `);
        //         this.isSpinnerVisible = false;
        //     });
        // }); stara metoda, nowa pozwyżej
    }
    addSearchHTML(){
        $('body').append(`
        <div class="search-overlay">
        <div class="search-overlay__top">
          <div class="container">
            <i class="fa fa-search search-overlay__icon" aria-hidden='true'></i>
            <input type="text" class='search-term' placeholder='What are you looking for?' id="search-term">
            <i class="fa fa-window-close search-overlay__close" aria-hidden='true'></i>
          </div>
        </div>
        <div class="container">
          <div id="serach-overlay__results"></div>
        </div>
       </div>
        `);
        this.isSpinnerVisible = false;
    }
}

export default Search;