//global settings objects

//write settings to localStorage if so
function Collection(){
	
	this.storageAvailable = Modernizr.localstorage;

	this.defaultNull = false;
	
	//otherwise, set the settings and session
	//store a few values for use as limits
	this.widthOpen = '90%';
	this.widthClosed = '4.9999999%';
	this.speed = 200;
	this.defaultColor = "rgba( 15, 92, 172, 0.5 )";
	this.activeColor = "rgba( 255, 255, 255, 0.6 )";
	
	this.hideBackgroundImage = '-10000px -10000px';
	this.showBackgroundImage = 'right';
	
	//off the bat, set a debug flag (lots of very verbose console messages if set to true)
	this.debug = false; //could usefully be true or false and "level2" or "level3"
	
	//This object is used EVERYWHERE...
	this.liveInfo = new Object();

	//create a few default values that always should be present for the application
	//set todays date and instantiate moment
	var now = moment( new Date() );
	//write to storage
	this.liveInfo.currentDate = now.toDate();
	//push 30 days forward onto storage
	this.liveInfo.futureDate = now.add("days", 30).format("YYYY-MM-DD");
	
	//set flag for use as a content switch
	this.liveInfo.setOriginalCallDate = false;
	
	//defaults need to be set upon the first run.
	if( arguments[ 0 ] == false || 'undefined' ){
		//set defaults for used values
		this.liveInfo.originalDownload 				= 
		this.liveInfo.returningUser 				= 
		this.liveInfo.userAddress 					= 
		this.liveInfo.googleMapsOriginAddresses 	= 
		this.liveInfo.googleMapsDestinations 		= 
		this.liveInfo.userInput 					= 
		this.liveInfo.setOriginalCallDate			= 
		this.liveInfo.nameOfSelf 					= this.defaultNull;
	}
	
	this.saveAll = function(){ console.log( "saveAll Method not yet implemented." ); }
	
	this.error = function( id, message ){
			this.id = id;
			this.message = message
		};

	this.saveLiveInfo = function(){
		try{
			if( !this.storageAvailable ) throw error( 'emptiness', 'no localStorage available - writing to cookie' );
			
			//doing it the cheap way to get this done,
			//ideally we would walk through the object and store one by one
			//so that we could pull one property as needed.
			//currently it is a huge object with the full downloaded mealsites listing
			
			localStorage.removeItem( 'liveInfo' );
			var serialized = JSON.stringify( this.liveInfo );
			localStorage.setItem( 'liveInfo', serialized );
			return true;
			/*
			for( property in this.liveInfo ){
				localstorage[ this ] = this[ property ];
			}
			
			for( property in object ){
					localStorage[ "liveInfo" ][ property ] = this[ "liveInfo" ][ property ];
				}
			*/
			
			return true;
		}catch( error ){
				console.log( error );
				//cookie fallback
				//@todo throw new error and switch to cookies there
				var tempObject = $.extend( true, {}, this.liveInfo );
				tempObject.originalDownload = this.defaultNull;
				tempObject.googleMapsDestinations = this.defaultNull;
				var tempString = JSON.stringify( tempObject );
				$.cookie( 'smallInfo', tempString, { expires: 365, path: '/' } );
				return true;
			}
		}
	
	this.saveOne = function( property ){
			localStorage[ property ] = this[ property ];
			return true;
		}
		
	this.readLiveInfo = function(){
		try{
			if( !this.storageAvailable ) throw error( 'love', 'no localStorage available - reading from cookie' );
			if( !localStorage.getItem( 'liveInfo' ) ) throw error( 'indifference', 'localstorage present, but empty' );
			
			
			var tempLiveInfo = localStorage.getItem( 'liveInfo' );
			
			this.liveInfo = JSON.parse( tempLiveInfo );
			
			/*
			for( property in this ){
					this[ "liveInfo" ][ property ] = localStorage[ "liveInfo" ][ property ] ;
				}
			*/
			return true;
		}catch( error ){
				console.log( error );
				console.log( 'can\'t read from disk. Attempting to read from cookie' );
				var tempCookie = $.cookie( 'smallInfo' );
				var tempJson = JSON.parse( tempCookie );
				
				for( property in tempJson ){
					this.liveInfo[ property ] = tempJson[ property ];
				}
			}
		}
	
	this.readAll = function(){ console.log( 'readAll method not implemented. Feel free to override :-)' ); }
	
	this.readOne = function(){
			this[ property ] = localStorage[ property ];
			return this[ property ];
		}
		
	this.countAll = function(){
			var count = 0;
			for( item in this ){ 
				if( item != "undefined" ) count++;
			}
			
			return count;
		}
		
	this.test = function(){
		try{
			console.log( "This is the current contents of the " + this.nameOfSelf + " Collection:" );
			console.log( this );
			return true;
		}catch( error ){
			console.log( error );
		}
	}
	
	this.liveTest = function(){
			try{
				console.log( "This is the current contents of the liveInfo object:" );
				console.log( this.liveInfo );
			}catch( error ){
				console.log( error );
			}
		}
}	