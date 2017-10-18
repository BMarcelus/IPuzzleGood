var IMAGES = [];
var imagesLoaded = 0;
	var soundLoaded=0;
	var finishedLoading = false;
	function imageLoaded()
	{
		imagesLoaded++;
		if(imagesLoaded==imagesToLoad.length)
		{
			finishedLoading=true;
			loadComplete();
		}
	}
	function soundLoaded()
	{
		soundsLoaded++;

	}

	function loadImages(names)
	{
		result = {};
		for(var i=0;i<names.length;i++)
		{
			var image = new Image();
			image.i = i;
			image.onload = imageLoaded;
			image.src = "./imagesContrast/"+names[i]+".png";
			image.alt = "image not loaded";
			result[names[i]]=image;

		}
		return result;
	}
	var Oldersound = false;
	// function getInternetExplorerVersion()
	// {
	//     var rv = -1; // Return value assumes failure.
	//     if (navigator.appName == 'Microsoft Internet Explorer') {
	//         var ua = navigator.userAgent;
	//         var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
	//         if (re.exec(ua) != null)
	//             rv = parseFloat(RegExp.$1);
	//     }
	//     return rv;
	// }

	// var browserVer = getInternetExplorerVersion();
	// if (browserVer > -1 && browserVer < 9) {
	//     Oldersound=true;
	//     console.log("using embed for sound");
	// }
	function loadSounds(names)
	{
		result = {};
		for(var i=0;i<names.length;i++)
		{
			if(Oldersound)
			{
				var em  = document.createElement("EMBED");
				em.src = "./sounds/"+names[i];
				em.autostart= false;
				em.width=2;
				result[names[i]]=em;
			}
			else
			{
				var sound = new Audio();
				sound.i = i;
				sound.onload = soundLoaded;
				sound.src = "./sounds/"+names[i];
				sound.alt = "sound not loaded";
				result[names[i]]=sound;
			}
			

			

		}
		return result;
	}
	function loadSound(name,auto,loop)
	{
		var result;
		if(Oldersound)
		{
			var em  = document.createElement("EMBED");
			em.src = "./sounds/"+name;
			em.autostart= false;
			em.width=2;
			result=em;
		}
		else
		{
			var sound = new Audio();
			sound.i = i;
			sound.onload = soundLoaded;
			sound.src = "./sounds/"+name;
			sound.alt = "sound not loaded";
			result=sound;
		}
		if(auto)result.autoplay = true;
		if(loop)
		{
			if (typeof result.loop == 'boolean')
			{
			    result.loop = true;
			}
			else
			{
			    result.addEventListener('ended', function() {
			        this.currentTime = 0;
			        this.play();
			    }, false);
			}
		}
		return result;
	}

	 // var hitsound = new Audio();
  //  hitsound.src = "./sounds/strike hit2.wav";

	   function playSound(sound)
	   {
	   	if(!soundsEnabled)return;
	   		if(sound.currentTime)
	   		{
	   			sound.currentTime=0;
	   			
	   		}
	   			sound.play();

	   }


	   var loadComplete = function(){};