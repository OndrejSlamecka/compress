(function(){
   "use strict";

/**
 * Responsible for file upload
 */
function FileUpload(file, user_options) {

	/* Settings */
	var options = {
		action: 'process',
		success: function(){},
		progressBar: null
	};

	for (var key in user_options) 
    { 
        if (user_options.hasOwnProperty(key))
        {
            options[key] = user_options[key];
        }
    }

	/* Uploading */	
	var xhr = new XMLHttpRequest();

	// Open request and pass the filename in the header
	xhr.open("POST", options.action, true);	
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.name));
    xhr.setRequestHeader('X-File-Size', file.size);

	xhr.upload.addEventListener("progress", function(event)
    {	
		if (event.lengthComputable)
		{  
			var percentage = Math.round((event.loaded * 100) / event.total);
			options.progressBar.update(percentage);
		}  
	}, false); 
    
	// Response received
	xhr.onreadystatechange = function()
	{
		if (xhr.readyState === 4)
		{
			if ((xhr.status >= 200 && xhr.status <= 200) || xhr.status === 304)
			{
                options.progressBar.success();
				options.success(JSON.parse(xhr.response), options.progressBar);
			}  
		}  
	};

    if (navigator.userAgent.indexOf("Firefox") !== -1)
    {
        // AFAIK, this is the right way. But only supported by Mozilla Firefox
        var fileReader = new FileReader();
        fileReader.onload = function(event)
        {     
            xhr.sendAsBinary(event.target.result);
        };
        fileReader.readAsBinaryString(file); // Read the file   
    } else {
        /* Chrome way */
        xhr.send(file);    
    }
}  

var _progressBar_counter = 0;
function ProgressBar(element)
{
	_progressBar_counter++;
	this.id = _progressBar_counter;

	/* Twitter Bootstrap layout
	<div class="progress">
        <div class="bar"></div>
	</div>
	*/	

	element.className = 'progress';
	var bar = document.createElement('div');
	bar.className = 'bar';
	element.appendChild(bar);
	this.element = bar;	

	this.update = function(value)
	{		
		this.element.style.width = value + '%';
	};

	this.success = function(message)
	{
		this.update(100);
		this.element.parentNode.className += ' progress-success';
		this.element.innerHTML = message;
	};

	this.error = function()
	{
		this.element.parentNode.className = 'progress progress-danger';
	};

	this.setMessage = function(text)
	{
		this.element.innerHTML = text;
	};
}

window.onload = function(){
    var dropbox;  
    dropbox = document.getElementById("receiver");  
    dropbox.addEventListener("dragenter", eventMute, false);
    dropbox.addEventListener("dragover", eventMute, false);
    dropbox.addEventListener("drop", drop, false);

    function eventMute(event){
        event.stopPropagation();
        event.preventDefault();
    }

    var progressBars = document.getElementById('progress');
    function drop(event) {  
        eventMute(event);

        var files = event.dataTransfer.files;

        for(var i = 0; i < files.length; i++)
        {
            var progressElement = document.createElement('div');
            progressBars.appendChild(progressElement);
            var progressBar = new ProgressBar(progressElement);

            new FileUpload(files[i], {
                success: uploadSuccess,
                progressBar: progressBar
            });
        }

        function uploadSuccess(payload, progressBar)
        {
            if (payload.status === 'error') {
                progressBar.error();
                progressBar.setMessage(payload.message);
            } else {
                progressBar.setMessage('<a href="./download/' + payload.filename + '">Download ' + payload.filename + '</a>');
            }
        }
    }
};

})();