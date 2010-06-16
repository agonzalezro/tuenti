function TuentiAssistant() { }

TuentiAssistant.prototype.setup = function() {
	this.controller.stageController.setWindowOrientation("free");

	this.wall_showed = 0;
	this.messages_showed = 0;
	this.cookied_tuentiemail = new Mojo.Model.Cookie('tuentiemail');
    this.cookied_password = new Mojo.Model.Cookie('password');
	
	this.tuentiemail = this.cookied_tuentiemail.get();
	this.password = this.cookied_password.get();
	
	if ((this.password == null) || (this.tuentiemail == null)) {
		this.controller.stageController.pushScene("preferences");	
	}
	
	this.controller.setupWidget("Progress",
        this.attributes = {
            title: "Cargando...",
			modelProperty: "progress"
        },
        this.progressModel = {
            progress: 0
        }
    );
	
    this.controller.setupWidget("Tuenti", { 
               url: "http://m.tuenti.com"
          }
    );
	
	this.controller.setupWidget(Mojo.Menu.appMenu,
        this.attributes = {
            omitDefaultItems: true
        },
        this.model = {
            visible: true,
            items: [ 
                Mojo.Menu.editItem,
                { label: "Preferencias...", command: 'do-preferences' },
            ]
        }
     );
	
    this.controller.setupWidget("Pages",
	    this.attributes = {
	        choices: [
	            {label: "Inicio", value: 1},
	            {label: "Perfil", value: 2},
				{label: "Mensajes", value: 3}
	        ]
	    },
	    
		this.model = {
			value: 1,
	        disabled: false
	    }
	); 
	
	this.controller.setupWidget('Filter', {delay: 2000});
	
	this.pages = this.controller.get("Pages");
	this.progress = this.controller.get("Progress");
	this.tuenti = this.controller.get("Tuenti");
	this.filter = this.controller.get("Filter");
	
	Mojo.Event.listen(this.pages, Mojo.Event.propertyChange, this.changedEvent.bind(this));
	Mojo.Event.listen(this.filter, Mojo.Event.filter, this.filterEvent.bind(this));
	Mojo.Event.listen(this.filter, Mojo.Event.filterImmediate, this.filterImmediateEvent.bind(this));
	Mojo.Event.listen(this.tuenti, Mojo.Event.webViewTitleUrlChanged, this.urlChargedEvent.bind(this));
	Mojo.Event.listen(this.tuenti, Mojo.Event.webViewLoadProgress, this.loadProgressEvent.bind(this));
	
	//this.tuenti.mojo.isEditing(this.editingEvent.bind(this, Mojo.Event.renderAltCharacters, this.tuenti, event.keyCode));
	var request = new Ajax.Request("http://m.tuenti.com/?m=login&func=process_login", {
		method: 'post',
		parameters: {'tuentiemail': this.tuentiemail, 'password': this.password},
		onSuccess: this.ajaxRequestSuccess.bind(this)
	});
	setInterval(check_news.bind(this), 10000);
}

function check_news() {
	var request = new Ajax.Request("http://m.tuenti.com/?m=login&func=process_login", {
		method: 'post',
		parameters: {'tuentiemail': this.tuentiemail, 'password': this.password},
		onSuccess: this.ajaxRequestSuccess.bind(this),
		onFailure: function(transport) { Mojo.Log.error("Failure!"); }
	});	
}

TuentiAssistant.prototype.handleCommand = function(event) {
	if (event.type == Mojo.Event.command) {
		switch (event.command) {
			case 'do-preferences':
				this.controller.stageController.pushScene("preferences");	
			break;
		}
	}
}

TuentiAssistant.prototype.ajaxRequestSuccess = function(transport) {	
	//1 mensaje|1 message|1 missatge|1 mensaxe|Iruzkin 1
	var messages = String(transport.responseText.match("[0-9]+ (mensaje|message|missatge)|ruzkin.*[0-9]+"));
	messages = messages.match("[0-9]+");
	
	//1 nuevo|1 wall|1 comentari|1 entrada|mezu 1
	var wall_posts = String(transport.responseText.match("[0-9]+ (wall|nuevo|comentari)|ezu.*[0-9]+"));
	wall_posts = wall_posts.match("[0-9]+");
	
    if (messages == 1) { messages = "1 mensaje privado"; }
    else if (messages > 1) { messages = messages + " mensajes privados"; }
    
    if ((messages != 0) && (messages != this.messages_showed)) {
        //We need this if because if we are reading several messages the alert will be showed. It isn't necessary because we are reading them actually.
        if (!this.url.match("/?m=messaging")) {
            this.messages_showed = messages;
            this.controller.showBanner({messageText: messages, soundClass: "alerts"}, {}, "");
        }
    }
    
	if (wall_posts == 1) { wall_posts = "1 comentario"; }
    else if (wall_posts > 1) { wall_posts = wall_post + " comentarios"; }
	
    if ((wall_posts != 0) && (wall_posts != this.wall_posts)) {
        //idem
        if (!this.url.match("/?m=profile&func=my_profile")) {
            this.wall_showed = wall_posts;
            this.controller.showBanner({messageText: wall_posts, soundClass: "alerts"}, {}, "");
        }
    }
}

TuentiAssistant.prototype.loadProgressEvent = function(loadEvent) {	
	if (loadEvent.progress < 100) {
		$("progressbar").style.display = "block";
		
		this.progressModel.progress = loadEvent.progress;
		this.controller.modelChanged(this.progressModel, this);
	}
			
	var progress = loadEvent.progress;
	
	switch (progress) {
		case 100:
			this.progress.mojo.reset();
			$("progressbar").style.display = "none";
			
			if (this.url.match("http://m.tuenti.com/?$|m=home")) 
				value = 1;
			else if (this.url.match("/?m=profile&func=my_profile")) {
				//this.wall_showed = false;
				value = 2;
			} else if (this.url.match("/?m=messaging")) {
				//this.messages_showed = false;
				value = 3;
			} else 
				value = -1;
			
			this.attributes.title = "Cargando...";
			this.model.value = value;
			this.controller.modelChanged(this.model, this);
		break;
	}
	
}

TuentiAssistant.prototype.changedEvent = function(propertyChangeEvent){
	var url;
	
	switch (propertyChangeEvent.value) {
		case 1: url = "http://m.tuenti.com"; break;
		case 2: url = "http://m.tuenti.com/?m=profile&func=my_profile"; break;
		case 3: url = "http://m.tuenti.com/?m=messaging"; break;
	}
	
	this.tuenti.mojo.openURL(url);
}

TuentiAssistant.prototype.filterImmediateEvent = function(filterEvent) {
	$("progressbar").style.display = "none";
	
	if (filterEvent.filterString.length >= 2) {
		this.tuenti.mojo.openURL("http://m.tuenti.com/?m=friends&func=search&query=" + filterEvent.filterString + "&search_entity=friends");
	}
}

TuentiAssistant.prototype.filterEvent = function(filterEvent) {
	this.filter.mojo.close();
}
 
TuentiAssistant.prototype.urlChargedEvent = function(urlEvent){
	this.url = urlEvent.url;
}

