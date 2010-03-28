function TuentiAssistant() { };

TuentiAssistant.prototype.setup = function() { 
    this.controller.setupWidget("Tuenti", { 
               url: "http://m.tuenti.com" 
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
	this.tuenti = this.controller.get("Tuenti");
	this.filter = this.controller.get("Filter");
	
	Mojo.Event.listen(this.pages, Mojo.Event.propertyChange, this.changedEvent.bind(this));
	Mojo.Event.listen(this.filter, Mojo.Event.filter, this.filterEvent.bind(this));
	Mojo.Event.listen(this.filter, Mojo.Event.filterImmediate, this.filterImmediateEvent.bind(this));
	Mojo.Event.listen(this.tuenti, Mojo.Event.webViewTitleUrlChanged, this.urlChargedEvent.bind(this));
};


TuentiAssistant.prototype.changedEvent = function(propertyChangeEvent){
	switch (propertyChangeEvent.value) {
		case 1: url = "http://m.tuenti.com"; break;
		case 2: url = "http://m.tuenti.com/?m=profile&func=my_profile"; break;
		case 3: url = "http://m.tuenti.com/?m=messaging"; break;
	}
	
	this.tuenti.mojo.openURL(url);
}

TuentiAssistant.prototype.filterImmediateEvent = function(filterEvent) {
	this.tuenti.mojo.openURL("http://m.tuenti.com/?m=friends&func=search&query=" + filterEvent.filterString + "&search_entity=friends");
}

TuentiAssistant.prototype.filterEvent = function(filterEvent) {
	this.filter.mojo.close();
}
 
TuentiAssistant.prototype.urlChargedEvent = function(urlEvent){
	url = urlEvent.url;
	
	//Change to a regular expression
	if (url.match("http://m.tuenti.com/?$|m=home"))
		value = 1;
	else if (url.match("/?m=profile&func=my_profile"))
		value = 2;
	else if (url.match("/?m=messaging"))
		value = 3;
	else
		value = -1;
		
	this.model.value = value;
	this.controller.modelChanged(this.model, this);

}

