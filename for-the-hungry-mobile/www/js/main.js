$(document).ready( function( $ ){

	//persist object is used for nearly all settings and storage...
	var persist = new Collection( false );
	persist.nameOfSelf = "persist"
	//pull from storage (if it exists either in localStorage or cookies)
	persist.readLiveInfo();
	persist.test();
	persist.liveTest();
	

	try{
		//if we don't have the download already local, pull one
		if( !persist.liveInfo.originalDownload ){
			//else pull a document from the server (placeholder for actual ajax call to 2-1-1 website)
			$.get('sample-mealsites.html', function( data  ){
				//make a copy of download into global settings object
				persist.liveInfo.originalDownload = data.replace(/(\r\n|\n|\r|\s+)/gm, " ").trim();
				//display placeholder (temporary, but needed if either google or facebook api fail)
				$( '#content > div > div:first' ).append( persist.liveInfo.originalDownload );
			});
		} else {
			//just use the local one
			$( '#content > div > div:first' ).append( persist.liveInfo.originalDownload );
		}
	}catch( error ){ console.log( error ) }
	
	//if so pull the session back into play
	if( persist.storageAvailable ){
		//create a locations object to store and configure Google Maps requests
		//stored in browser localStorage
		try{
			persist.readLiveInfo();
			persist.test();
		}catch( error ){
			console.log( error );	
		}
	}
	
	// save all if unloading for next time
	$( document ).unload( function( ){
			if( persist.storageAvailable ) persist.saveLiveInfo();
		});
	
	try{
	//demonstrate slides
		if( !persist.liveInfo.returningUser ){
			//as it is hidden, show page
			$( '#container' ).fadeIn( 1000 , function(){
					//explain to user that sliders move
					
				//hold a set of slots for timeout ids
				var timeout = new Array();
				
				//reverse the elements of the jQuery object
				//by converting to an array, reversing, the then rewrapping with jQuery
				var $reversed = $( $( '#content > div > div' ).toArray().reverse() );
				
				$reversed.each( function( index ){
						var toWait = 200 * ( index + 1 );
						var $reversedThis = $( this );
						$.doTimeout( toWait, function(){ $reversedThis.trigger( 'mouseenter' ) } );
					});		
		});
	}else{
		//restore from storage
		persist.readLiveInfo();
		//no point in demonstrating slides to someone that has already been here
		$( '#container' ).show();
			
	}
	}catch( error ){ console.log( error ); }
	
    //upon interaction
    $( '#content > div').mouseenter( function( ){
		//cancel any other animations and timeouts
		$().stop( true ).doTimeout( true );
        //slide others back shut and change their color and background back to default
        //also, be sure to reset the animation queue in case of multiple triggers of the event
        $( '#content > div').not($(this)).stop(true).animate({
            width: persist.widthClosed
        }, {
            duration: persist.speed
        }).css({
            'background-color': persist.defaultColor,
            'background-position': persist.showBackgroundImage,
            'color': 'white'
        });

        //slide open current element and change color
        $(this).animate({
            width: persist.widthOpen
        }, {
            duration: persist.speed
        }).css({
            'background-color': persist.activeColor,
            'color': 'black',
            'background-position': persist.hideBackgroundImage
        });
    });

    $( '.reminder' ).live( "click", function( ){
        persist.liveInfo.setOriginalCallDate = true;
        //present user with the info
        quickFooterTemplate( "second", persist.liveInfo.futureDate );
        //save it to localStorage (and therefore to the global scope)
		persist.saveLiveInfo();
        //alert("New dates saved. A date 30 days in the future are set in place. but you can resave them at any time. Drop back into the app to see the countdown.");
    });

    //This is a poor hack... but the duplication was driving me batty
    function quickFooterTemplate( whichContent ){

        //set a quick default var
        //if nothing is supplied to the template, show default case
        var which = whichContent || 'default';
        var needToWait;
        var whenCalled = moment( Array( String( persist.liveInfo.currentDate ) ) ).fromNow();

        //default display decisions
        //check if we have more than one argument (special case for 'final' template as it seems to pull a persist value before it is ready...)
        //if we don't pull the needed value
        //if it isn't available, fall back to default
        //(low quality hack, mind you. it would be better to redesign the approach, but I just don't have the time at this time)
        //if we do, set that value
        if( arguments.length > 1 ) needToWait = moment( String( arguments[ 1 ] ) ).fromNow();
        else if( persist.liveInfo.setOriginalCallDate ) needToWait = moment( persist.liveInfo.futureDate ).fromNow();

        switch( which ){

        case 'first' || 'firstSeen' || 1:

            $( '#footer' ).html('<p>If you are in need of emergency food, <em>call the phone number 2-1-1</em> to recieve foodstuffs for your home.</p><p>You will talk to a trained representative first and you may only recieve emergency food <em>once every 30 days.</em></p><p>Once you call, <a class="reminder">click&nbsp;here</a> to have an in-app reminder set.</p>');
			$( '#footer p' ).each( function( index ){
					$( this ).prepend( '<div id="num">' +  ++index + '</div>' );
				});
			$( '#footer' ).append('<p id="whoFor">On behalf of the Hunger Task Force of the Greater Milwaukee Area.</p>' );

            break;


        case 'second' || 'final' || 0:


            $( '#footer' ).html("<p>You may <em>call 2-1-1</em> for emergency food supplies <em>" + needToWait + "</em>.</p>");
            $( '#footer' ).append('<p>You originally called ' + whenCalled + '</p>');
            $( '#footer' ).append('<p>Want to <a class="reminder">save&nbsp;today\'s&nbsp;date</a> to get your next emergency food supplies?</p>');
			$( '#footer p' ).each( function( index ){
					$( this ).prepend( '<div id="num"></div>' );
				});
			$( '#footer' ).append('<p id="whoFor">On behalf of the Hunger Task Force of the Greater Milwaukee Area.</p>' );

            break;


        case 'default':
			$( '#footer' ).append('<p id="whoFor">On behalf of the Hunger Task Force of the Greater Milwaukee Area.</p>' );
			
            break;

        }

    }

    //do or don't display content that depends upon features, particularly localStorage and sessionStorage    

    function chooseWhichTemplate( ){
        //if nothing is available, go ahead and display default template
        //reset footer after setting main content
        if(  !!persist.liveInfo.setOriginalCallDate ) quickFooterTemplate('second', persist.liveInfo.futureDate ); //if we have set the date to call 2-1-1
        else if( !!persist.storageAvailable )quickFooterTemplate('first'); //if we have not, but have the ability to do so
        else quickFooterTemplate(); //default
    }
    chooseWhichTemplate(); //run it right off the bat

    //upon clicking the logo, simulate a home reset of app
    $( '#header h1' ).click( function( ){
        $( '#content > div:first' ).trigger("mouseenter");
		//we could refresh the presentation, as well. Hmmm...
    });


    //store the value of the search box to reinstate later
    var searchText = $( '#addressForm' ).attr("value");
    //set the text of the textbox to none upon focus
    $( '#addressForm' ).focus( function( ){
        $(this).attr("value", "");
    });

    $( '#addressForm' ).focusout( function( e ){
        if( $( this ).attr( "value" ) == "") $(this).attr( "value", searchText);
    });

    //process downloaded document, and send to Google Maps to return a distance matrix
    //append distance matrix to appropriate elements in document, then sort by distance and display closest location
    $( '#send' ).click( function( ){
		//first, check if the address to be requested is already here
        persist.liveInfo.userInput = $( '#addressForm' ).val();
		
		//do nothing and leave handler (put first because it is likely going to be the case most often: as in a user clicking the button multiple times)
		//@todo this needs to change -- currently the only way to reset the selected mealsite address presented is to trigger this handler.
		//however, it doesn't matter if we have the response already saved, so go ahead
		if(
			persist.liveInfo.userAddress == persist.liveInfo.userInput && 
			!!$( '#findClosest' ).length ||
			persist.liveInfo.userInput == '' ||
			persist.liveInfo.userInput == 'Enter your address to find the closest Milwaukee Free Meal Site'
			)
			return;

        //prepare for additional iterations (second or more times through here) through by resetting values to nothing then collecting values
        if( !!persist.liveInfo.returningUser ){

           if( persist.liveInfo.userAddress != persist.liveInfo.userInput ){
                //if we get here, they are a returning user that has instigated a new search.
				//we can't used saved data; flush everything related to google maps, we are starting over
                persist.liveInfo.googleMapsRequestStatus 			= 
                persist.liveInfo.googleMapsResponse 				= 
                persist.liveInfo.locations 							= 
                persist.liveInfo.destinationsToSendToGoogleMaps 	= 
				persist.liveInfo.userAddress						=
                persist.liveInfo.originsToSendToGoogleMaps 			= persist.defaultNull;
            }
			
			//reset the display of addresses to original status
			$( '#all_mealsites' ).replaceWith( persist.liveInfo.originalDownload );
		
        }
		
		try{
			//it's a brand spanking new request
			//build object to send
			//make call to Google Maps
			persist.liveInfo.userInput = $( '#addressForm' ).val();
			//persist.saveOne( persist.liveInfo.userInput );
			//first get origin location for later comparison from input
			persist.liveInfo.userAddress = persist.liveInfo.userInput; //syncing for regurlar first time user
	
			//if we have a totally fresh request set up the following values for sending to google maps
	   
			//set origin (Google Maps accepts an array only)
			persist.liveInfo.googleMapsOriginAddresses = new Array( persist.liveInfo.userAddress );

			//set destinations (Google Maps accepts an array only)
			persist.liveInfo.googleMapsDestinations = new Array();            

			//prepare data from 2-1-1
			//spool the addresses into storage and replace the newline characters with spaces, then set multiple spaces to single spaces, and finally, remove leading and trailing spaces
			$( '.address' ).each(function(index, thisElement ){
				persist.liveInfo.googleMapsDestinations[index] = thisElement.textContent.replace(/(\r\n|\n|\r|\s+)/gm, " ").trim();
			});
		}catch( error ){
				persist.test();
				console.log( localStorage );
				localStorage.flush();
				console.log( error );
			}

        

        //if we don't yet have a response from google saved, get one
        if( !persist.liveInfo.googleMapsResponse ){
			//send prepared object to Google Maps Distance Matrix service
			var service = new google.maps.DistanceMatrixService();
			service.getDistanceMatrix({
					origins: persist.liveInfo.googleMapsOriginAddresses,
					destinations: persist.liveInfo.googleMapsDestinations,
					travelMode: google.maps.TravelMode.DRIVING,
					unitSystem: google.maps.UnitSystem.IMPERIAL
				}, spoolToJQueryObject);
        } else {
            //otherwise, go ahead and run it with the saved data
            spoolToJQueryObject( persist.liveInfo.googleMapsResponse, persist.liveInfo.googleMapsRequestStatus);
        }

        //read response
        function spoolToJQueryObject(response, status ){

            //if all's good, dissect the JSON returned and update elements to include info
            //so that all values have an easy storage object outside of this function
            if( status == google.maps.DistanceMatrixStatus.OK ){

                if(  persist.liveInfo.googleMapsResponse != response  ){
                    //store the whole thing so that we can avoid identical reqeusts
                    persist.liveInfo.googleMapsResponse = response;
                    persist.liveInfo.googleMapsRequestStatus = status;
                }
               	

                var origins = response.originAddresses;
                var destinations = response.destinationAddresses;

                for( var i = 0; i < origins.length; i++ ){

                    var results = response.rows[i].elements;

                    for( var j = 0; j < results.length; j++ ){
						
                        var distanceTo = results[ j ].distance.text;
                        var durationTo = results[ j ].duration.text;
						var from = origins[ i ];
						var to = destinations[ j ];

                        //attach distances to original mealsites collection or replace if already exists
                        $( '.matchlist_panel' ).eq(j).append('<div id="distance"><p>Distance to this meal site is: <span id="findClosest">' + String( distanceTo ) + '</span></p></div>');
                    }
                }
                $( '.matchlist_panel' ).tsort('#findClosest');

                //totally cheap method, but hide the rest... //@todo find a better method or rewrite sort... 
                //Every sort plugin uses the jQuery DOM manipulation methods to sort, rather then just doing it in regular memory on the $()[] array
                //And so they requires elements to be in the dom and is a bit restrictive because of it.
                $( '.matchlist_panel:gt( 0 )' ).hide();

                //finally, display the correct opener for the mealsite panel
                $( '.matchlist_panel' ).prepend("<div><p>This is the free meal site closest to your home:</p></div>");
				
				//finished at least one iteration of session feature, propagate the global flags for next time...
                persist.liveInfo.returningUser = true;

                //reset footer after setting main content
                chooseWhichTemplate();
				
				persist.saveLiveInfo();
				persist.test();	
            }
        } //function spoolToJqueryObject    
    });
	
	
	 //restore original search
	 //this trigger MUST be UNDER the original object on which it triggers an event
	 //this handler can be extended to return all of the app state
	 //no time for now, but this is a good approximation
	if( !!persist.liveInfo.userAddress ){
		try{
			$( '#addressForm' ).val( persist.liveInfo.userAddress );
			$( '#send' ).trigger('click');
		}catch( error ){ console.log( error );}
	}
	
	//capture the enter key at any time
	//it is resetting the app instead of submitting the form
	$( 'form' ).keydown( function( event ){
		try{	
			if( event.which == 13 ){
				event.stopImmediatePropagation();
				event.preventDefault();
				$( '#send' ).trigger( 'click' );
			}
		}catch( error ){ console.log( error ); }
	});

    // used when bragging to friends within the Donation section of the app
    //attach event handler to brag to friends donation link
    $( '#donationBrag > p a' ).click( function( ){

        var sendToFeed = {
            method: 'feed',
            link: 'https://apps.facebook.com/forthehungry/',
            name: 'I fed the hungry!',
            caption: 'I just donated to The Hunger Task Force!',
            description: 'You can be directed to the donation page of The Hunger Task Force, as well as other features such as being directed to your nearest Milwaukee area meal center using The Hunger App.'
        };
        
        function callback(response ){
            //@todo react to failure, as well as notify user that feed post now exists.
        }

        FB.ui(sendToFeed, callback);
    });

    $( '#friendsPanel div p:eq(1) a' ).click( function( ){
        FB.ui({
            method: 'apprequests',
            message: 'Tell others that there is help with hunger.'
        });
    });

    $( '#friendsPanel div p:eq(2) a' ).click( function( ){
        FB.ui({
            method: 'send',
            name: 'People that can help with hunger.',
            link: 'http://hungertaskforce.org',
        });
    });

    $( '#friendsPanel div p:eq(4) a' ).click( function( ){
        FB.ui({
            method: 'send',
            name: 'A friend helps friends; and a friend thinks the phone number 2-1-1 might be of help.',
            link: 'http://www.impactinc.org/impact-2-1-1/',
        });
    });

    window.fbAsyncInit = function( ){
        // init the FB JS SDK
        FB.init({
            appId: '374687635931458',
            // App ID from the App Dashboard
            channelUrl: '//www.nickolasnikolic.com/facebook/channel.php',
            // Channel File for x-domain communication
            status: true,
            // check the login status upon init?
            cookie: true,
            // set sessions cookies to allow your server to access the session?
            xfbml: true,
            // parse XFBML tags on this page?
            frictionlessRequests: true // allow requests to be made with original authorization settings so that users don't have to permit every request to their freinds
        });

        // Additional initialization code such as adding Event Listeners goes here
        //check login status
        FB.getLoginStatus(function(response ){
            if( response.status === 'connected' ){
                // connected
                var uid = response.authResponse.userID;
                var accessToken = response.authResponse.accessToken;

                FB.api('/me', function(response ){
                });

            } else if( response.status === 'not_authorized' ){

                // not_authorized
                //send users Facebook Authentication dialogue to login and redirect back to app thereafter
                top.location.href = 'https://www.facebook.com/dialog/oauth?client_id=374687635931458&redirect_uri=https://apps.facebook.com/forthehungry/'

            } else {
                // not_logged_in
                //direct user back to facebook to log in.
                window.top.location = "https://facebook.com";

            }
        });

    };

    // Load the Facebook SDK's source Asynchronously
    (function(d ){
        var js, id = 'facebook-jssdk',
            ref = d.getElementsByTagName('script')[0];
        if( d.getElementById(id) ){
            return;
        }
        js = d.createElement('script');
        js.id = id;
        js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";
        ref.parentNode.insertBefore(js, ref);
    }(document));
});